import { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { videoData, defaultVideoData } from '../utils/types';
import {
    ROOM_JOIN_REQUEST,
    PEER_LEFT_ROOM,
    PEER_JOINED_ROOM,
    SIGNAL_DATA,
    REQUEST_CLOSE_PEER_CONNECTION,
    VIDEO_METADATA,    
} from '../common/socket-io-events';
import { removeInArray } from '../utils/common';
import { delay } from '../utils/promise-utils';
import cancelifyPromise, { CANCELED_PROMISE_EXCEPTION_NAME } from '../shared/cancelifyPromise';
import { connectionStates } from '../constants';
import stateFormatter from './peer-provider-state-formatter';
import { isStreamsEqual } from '../utils/media-stream-utils';

// socket.io client events are documented - https://github.com/socketio/socket.io-client/blob/master/docs/API.md
// todo:
// 0. Refactor and simplify this code. For now keeping it as it is.
// 1. Test for WEBRTC_SUPPORT support in the client and if not show appropriate error message to the user.
// 2. handle (or atleast log) the disconnect event as described in https://github.com/socketio/socket.io-client/blob/master/docs/API.md#event-disconnect
// 3. There is anothe slight bug - sometimes peer connection status stays hung in the "connecting" state.
// neigther do we get a connect event nor a close / disconnect event. to reproduce this -
//      1. Take two pc and open vcapp on both
//      2. Close the lid of one pc. Now peer connection breaks and peers will try to reconnect with each other.
//      3. First peer sees that both sender and receiver connections are connected.
//      4. But somehow the second peer never gets a "connect" event on its receiver peer and it sees that its
//        receiver connection is eternally hung in the "connecting" state.
//  But if we look closely - the receiver connection is actually connected and it able to read data messages sent from the 1st peer.
//  so can implement some mechanism where - if we don't get "connect" event with a certain delay we can
//  ask the other peer (via socket.io) what state does it see. also can ask to send us some data
//  message on the peer connection and see that if we do actually receive it. This will give us the
//  confirmation that we are actually connected.

// Notes:
// 1. Two reconnection attempts take around 5 secs. If reconnection fails after 2 attempts show error to the user. 

const SOCKET_IO_SERVER_URL = 'localhost:3500';
const PEER_RE_MIN_DELAY = 200; // in ms -> minimum delay to reestablish a peer connection

const isVideosEqual = (video1, video2) => {
    // check if two instances of video props are the same
    return video1.showLoading === video2.showLoading &&
        video1.showError === video2.showError &&
        isStreamsEqual(video1.stream, video2.stream);
}
class PeersProvider extends Component {
    state = {
        isConnected: false,
        numConnectionAttempts: 0,
        peers: null,
        // will keep details of connection with peers
        // key-> peerId
        // value-> {
        //     sender:  <connection state>
        //     receiver: <connection state>
        // }
        peerConnectionStatus: {},
        peerVideoMetadata: {},
        peerStreamObj: {},
    };

    constructor(props) {
        super(props);
        // keeps actual simpler peer connnection objects
        this.peerConnections = {};
        // keeps promises for reconnection of peers
        this.peerReconnectionPromises = {};
        // keeps a reference to previously sent stream
        this.previouslySentStream = {};

        this.socket = io(SOCKET_IO_SERVER_URL);

        this.socket.on('connect', () => {
            this.joinRoom();
        });

        this.socket.on('disconnect', (reason) => {
            // todo: clean any state / variables connected with individual peers
            this.setState({
                isConnected: false,
                peers: null
            });
            this.removeAllPeers();
        });
        
        this.socket.on('reconnecting', (attemptNumber) => {
            // todo: clean any state / variables connected with individual peers
            this.setState({
                isConnected: false,
                numConnectionAttempts: attemptNumber,
                peers: null
            });
            this.removeAllPeers();
        });

        this.socket.on(PEER_LEFT_ROOM, peerId => {
            if (peerId === this.socket.id) {
                // can this actually happen? - not likely
                // todo: log this to the server to check if this occurs in the wild
                return;
            }
            // todo: clean any state / variables associated with this peer
            this.setState(prevState => ({
                peers: removeInArray(prevState.peers, peerId)
            }));
            this.removePeer(peerId);
        });

        this.socket.on(PEER_JOINED_ROOM, peerId => {
            if (peerId === this.socket.id)
                return;
            let peers = this.state.peers;
            if (!peers) {
                // can this actually happen? - doesn't seem likely
                // todo: log this to the server
                peers = [];
            }
            const prevIndex = peers.indexOf(peerId);
            if (prevIndex !== -1) {
                // we already knew about this peer
                // so nothing to do here
                return;
            }
            peers = [...peers, peerId];
            this.addPeer(peerId);            
            this.setState({
                peers
            });
        });

        this.socket.on(SIGNAL_DATA, ({ peerId, data, emittedFromSender }) => {
            if (!this.peerConnections[peerId]) {
                this.addPeer(peerId);
            }
            if (emittedFromSender) {
                this.peerConnections[peerId].receiver.signal(data);
            } else {
                this.peerConnections[peerId].sender.signal(data);
            }
        });

        this.socket.on(REQUEST_CLOSE_PEER_CONNECTION, (peerId, cb) => {
            console.log(`got a request close peer connection with ${peerId}.`);
            this.removePeer(peerId, {
                shouldCancelPendingReconnections: false,
            });
            console.log(`actually closed my connection with ${peerId}. Replying this information back to him.`);
            cb();
        });

        this.socket.on(VIDEO_METADATA, ({ peerId, videoMetadata }) => {
            console.log(`got video metadata from ${peerId} - `, videoMetadata);
            this.setState(prevState => ({
                peerVideoMetadata: {
                    ...prevState.peerVideoMetadata,
                    [peerId]: videoMetadata
                }
            }));
        });
    }

    joinRoom() {
        this.removeAllPeers();
        this.setState({
            isConnected: false,
            numConnectionAttempts: 0,
            peers: null,
        });
        this.socket.emit(ROOM_JOIN_REQUEST, this.props.roomName, (err, peers) => {
            // todo: handle/ log err
            if (!peers) {
                console.log("got no peers back");
                // todo: handle this case appropriately later
                return;
            }
            // remove the current peer from the peers list
            peers = peers.filter(peerId => peerId !== this.socket.id);
            this.setState({
                isConnected: true,
                peers,
            });
            peers.forEach(peerId => {
                this.addPeer(peerId);
            });
        });
    }

    addPeer(peerId) {
        if (this.peerConnections[peerId]) {
            // already have and active connection with the peer
            return;
        }
        // check if there is a pending reconnection promise.
        // if yes then cancel that immediately
        if (this.peerReconnectionPromises[peerId]) {
            console.log(`already have a pending reconnection promise with ${peerId}. canceling that.`);            
            this.peerReconnectionPromises[peerId].cancel();
            this.peerReconnectionPromises[peerId] = null;
        }
        // update state to reflect this peer connection status to connecting
        this.updatePeerConnectionStatusState(peerId, {
            sender: connectionStates.CONNECTING,
            receiver: connectionStates.CONNECTING,
        });

        console.log(`adding a new peer ${peerId}`);
        // todo: add turn server config
        // first look at the default config and things on top of it
        // for sending video streams
        const sender = new Peer({ initiator: true });
        sender.on('signal', data => {
            // send this signal to the other peer via socket.io
            this.socket.emit(SIGNAL_DATA, {
                peerId,
                data,
                emittedFromSender: true,
            });
        });
        sender.on('connect', () => {
            console.log(`sender connection with ${peerId} established`);
            this.updatePeerConnectionStatusState(peerId, {
                sender: connectionStates.CONNECTED,
            });
        });
        sender.on('close', () => {
            // todo: should we do something here?
            // todo: can this happen that we get a close here (i.e p2p connection)
            // has closed, but we don't get PEER_LEFT_ROOM / disconnect / reconnecting
            // events even after significant time.
            // this would mean that this peer thinks the other peer is available
            // and connected via socket.io but not via a peer connection
            // should log the close and other events and figure out if this scenario
            // occurs in the wild.

            // note - ^ occurs when one peer closes the lid of the laptop
            // peer connection is closed but socket.io remains active
            console.log(`sender peer connection with ${peerId} closed`);
            if (this.peerConnections[peerId]) {
                console.log('will try to close this connection and restablish a new one');
                this.updatePeerConnectionStatusState(peerId, {
                    sender: connectionStates.DISCONNECTED,
                });
                this.reEstablishPeerConnection(peerId);
            }
        });
        sender.on('error', err => {
            console.log(`sender peer connection with ${peerId} threw error -`, err);
            if (this.peerConnections[peerId]) {
                console.log('will try to close this connection and restablish a new one');
                this.updatePeerConnectionStatusState(peerId, {
                    sender: connectionStates.DISCONNECTED,
                });
                this.reEstablishPeerConnection(peerId);
            }
        });
        // for receiving video streams
        const receiver = new Peer();
        receiver.on('signal', data => {
            this.socket.emit(SIGNAL_DATA, {
                peerId,
                data,
                emittedFromSender: false,
            });
        });
        receiver.on('connect', () => {
            console.log(`receiver connection with ${peerId} established`);
            this.updatePeerConnectionStatusState(peerId, {
                receiver: connectionStates.CONNECTED,
            });
        });
        receiver.on('close', () => {
            // todo: should we do something here?
            console.log(`receiver peer connection with ${peerId} closed`);
            if (this.peerConnections[peerId]) {
                console.log('will try to close this connection and restablish a new one');
                this.updatePeerConnectionStatusState(peerId, {
                    receiver: connectionStates.DISCONNECTED,
                });
                this.reEstablishPeerConnection(peerId);
            }
        });
        receiver.on('error', err => {
            console.log(`receiver peer connection with ${peerId} threw error - `, err);
            if (this.peerConnections[peerId]) {
                console.log('will try to close this connection and restablish a new one');
                this.updatePeerConnectionStatusState(peerId, {
                    receiver: connectionStates.DISCONNECTED,
                });
                this.reEstablishPeerConnection(peerId);
            }
        });
        receiver.on('stream', streamObj => {
            console.log(`got video streamObj from ${peerId} - `, streamObj);
            this.setState(prevState => ({
                peerStreamObj: {
                    ...prevState.peerStreamObj,
                    [peerId]: streamObj
                }
            }));
        });
        // todo: handle/ log the "error" events
        this.peerConnections[peerId] = { sender, receiver };
        this.sendVideoToPeer(peerId);
    }

    removePeer(peerId,
        {
            // this parameter decides that while removing this peer should we cancel any
            // pending reconnection promises. By default this is true, since removePeer
            // is usually called when a peer leaves the socket room, and in that case
            // we definetly know that the peer if offline and hence no point in trying to reconnect later
            // But in some situation we may want to close the current connection yet
            // try to reconnect after some time
            shouldCancelPendingReconnections = true
        } = {}
    ) {
        // check if there is a reconnection promise pending
        // if yes then cancel that immediately
        if (shouldCancelPendingReconnections && this.peerReconnectionPromises[peerId]) {
            console.log(`already have a pending reconnection promise with ${peerId}. canceling that.`);
            this.peerReconnectionPromises[peerId].cancel();
            this.peerReconnectionPromises[peerId] = null;
        }
        // if already no connection exists then nothing more to do
        if (!this.peerConnections[peerId]) {
            return;
        }
        // remove this peer from peerConnectionStatus tracking
        if (!this.peerReconnectionPromises[peerId]) {
            // if reconnection promises exists then we'll not delete this peer
            // from connection status tracking
            this.removePeerConnectionStatusState(peerId);
        }

        // remove peer video metadata and stream object
        this.removePeerVideoData(peerId);

        console.log(`closing peer connection with peer ${peerId}`);        
        const { sender, receiver } = this.peerConnections[peerId];
        this.peerConnections[peerId] = null;
        delete this.peerConnections[peerId];
        sender.destroy();
        receiver.destroy();
    }

    removeAllPeers() {
        Object.keys(this.peerConnections).forEach(peerId => {
            this.removePeer(peerId);
        });
    }

    requestClosePeerConnection(peerId) {
        // request the peerId to close simple peer connection with this peer
        // resolves when the peer confirms that it has actually closed
        return new Promise(resolve => {
            this.socket.emit(REQUEST_CLOSE_PEER_CONNECTION, peerId, () => {
                resolve();
            });
        });
    }

    reEstablishPeerConnection(peerId) {
        // if we already have a reconnection pending then don't do anything
        // todo: need to rethink if is what should be done ?
        if (this.peerReconnectionPromises[peerId]) {
            console.log(`--> already a pending reconnection promise with ${peerId}, so not doing anything else`);
            return;
        }
        // first close the existing connections if any
        this.removePeer(peerId);
        // request the remote peer to close his side of connections
        const remoteClosePromise = this.requestClosePeerConnection(peerId);
        const delayedPromise = Promise.all([
            delay(PEER_RE_MIN_DELAY),
            remoteClosePromise]);
        this.peerReconnectionPromises[peerId] = cancelifyPromise(
            delayedPromise
        );
        console.log(`initiated peer connection restablish sequence with ${peerId}. promises - `, {
            remoteClosePromise,
            delayedPromise,
            cancelifyed: this.peerReconnectionPromises[peerId]
        });

        this.peerReconnectionPromises[peerId]
            .then(() => {
                console.log(`initiated peer connection re-establishing sequence with ${peerId}`);
                this.peerReconnectionPromises[peerId] = null;
                this.addPeer(peerId);
            })
            .catch(err => {
                if (err.name === CANCELED_PROMISE_EXCEPTION_NAME) {
                    // this promise was cancelled
                    return;
                }
                // if not canceled but we some other err
                // todo: log this err for analysis
            });
    }

    updatePeerConnectionStatusState(peerId, { sender, receiver }) {
        // update new connection status in state
        this.setState(prevState => {
            let prevStatusState = prevState.peerConnectionStatus[peerId];
            if (!prevStatusState) {
                prevStatusState = {
                    sender: connectionStates.DISCONNECTED,
                    receiver: connectionStates.DISCONNECTED,
                };
            };
            if (!sender) {
                sender = prevStatusState.sender;
            }
            if (!receiver) {
                receiver = prevStatusState.receiver;
            }
            return ({
                peerConnectionStatus: {
                    ...prevState.peerConnectionStatus,
                    [peerId]: {
                        sender,
                        receiver,
                    },
                }
            });
        });
    }

    removePeerConnectionStatusState(peerId) {
        this.setState(prevState => {
            const { peerConnectionStatus } = prevState;
            const newPeerConnectionStatus = { ...peerConnectionStatus };
            delete newPeerConnectionStatus[peerId];
            return ({
                peerConnectionStatus: newPeerConnectionStatus
            });
        });
    }

    removePeerVideoData(peerId) {
        // remove video metadata and stream object corresponding to peerId
        this.setState(prevState => {
            const {
                peerVideoMetadata,
                peerStreamObj
            } = prevState;
            const newPeerVideoMetadata = { ...peerVideoMetadata };
            delete newPeerVideoMetadata[peerId];
            const newPeerStreamObj = { ...peerStreamObj };
            delete newPeerStreamObj[peerId];
            return ({
                peerVideoMetadata: newPeerVideoMetadata,
                peerStreamObj: newPeerStreamObj,
            });
        });
    }

    sendVideoToPeer(peerId) {
        const { showLoading, showError, stream } = this.props.selfVideo;
        let streamMetadata = null;
        let streamObj = null;
        if (stream) {
            const { hasAudio, hasVideo } = stream;
            streamMetadata = { hasAudio, hasVideo };
            if (hasAudio || hasVideo) {
                streamObj = stream.streamObj;
            }
        }
        const videoMetadata = {
            showLoading,
            showError,
            stream: streamMetadata,
        };
        // send the video metadata
        this.socket.emit(VIDEO_METADATA, { peerId, videoMetadata });
        if (streamObj) {
            // send the stream object
            // sometimes this throws error
            // todo: add try catch block around this. log this error.
            // and try and fix it
            this.peerConnections[peerId].sender.addStream(streamObj);
        }
    }

    sendVideoToAllPeers() {
        Object.keys(this.peerConnections).forEach(peerId => {
            this.sendVideoToPeer(peerId);
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.roomName !== prevProps.roomName) {
            // room changed. join the new room
            this.joinRoom();
        }
        if (!isVideosEqual(this.props.selfVideo, prevProps.selfVideo)) {
            this.sendVideoToAllPeers();
        }
    }

    render() {
        const { isConnected, numConnectionAttempts } = this.state;
        let peerVideos = null;
        if (isConnected) {
            peerVideos = stateFormatter(this.state);
        }
        return this.props.children({
            id: this.socket.id,
            isConnected,
            numConnectionAttempts,
            peerVideos
        }) || null;
    }
}

PeersProvider.propTypes = {
    roomName: PropTypes.string,
    selfVideo: videoData,
    children: PropTypes.func,
};

PeersProvider.defaultProps = {
    roomName: 'test-1',
    selfVideo: defaultVideoData,
    children: () => {},
};

export default PeersProvider;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { videoData } from '../utils/types';
import {
    ROOM_JOIN_REQUEST,
    PEER_LEFT_ROOM,
    PEER_JOINED_ROOM,
    SIGNAL_DATA,
} from '../common/socket-io-events';
import { removeInArray } from '../common/utils';

// socket.io client events are documented - https://github.com/socketio/socket.io-client/blob/master/docs/API.md
// todo:
// 1. Test for WEBRTC_SUPPORT support in the client and if not show appropriate error message to the user.
// 2. handle (or atleast log) the disconnect event as described in https://github.com/socketio/socket.io-client/blob/master/docs/API.md#event-disconnect

// Notes:
// 1. Two reconnection attempts take around 5 secs. If reconnection fails after 2 attempts show error to the user. 

const SOCKET_IO_SERVER_URL = 'f5629720.ngrok.io';

class PeersProvider extends Component {
    state = {
        isConnected: false,
        numConnectionAttempts: 0,
        peers: null,
    };

    constructor(props) {
        super(props);
        // keeps actual simpler peer connnection objects
        this.peerConnections = {};     
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
        });
        
        this.socket.on('reconnecting', (attemptNumber) => {
            // todo: clean any state / variables connected with individual peers
            this.setState({
                isConnected: false,
                numConnectionAttempts: attemptNumber,
                peers: null
            });
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
    }

    joinRoom() {
        Object.keys(this.peerConnections).forEach(peerId => {
            this.removePeer(peerId);
        });
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
            this.setState({
                isConnected: true,
                peers,
            });
            peers.forEach(peerId => {
                if (peerId !== this.socket.id) {
                    this.addPeer(peerId);
                }
            });
        });
    }

    addPeer(peerId) {
        if (this.peerConnections[peerId]) {
            // already have and active connection with the peer
            return;
        }
        console.log(`adding a new peer ${peerId}`);
        // todo: add turn server config
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
            console.log(`sender peer connection with ${peerId} closed`);
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
        });
        receiver.on('close', () => {
            // todo: should we do something here?
            console.log(`receiver peer connection with ${peerId} closed`);
        });
        // todo: handle/ log the "error" events
        this.peerConnections[peerId] = { sender, receiver };
    }

    removePeer(peerId) {
        if (!this.peerConnections[peerId]) {
            return;
        }
        console.log(`closing peer connection with peer ${peerId}`);
        this.peerConnections[peerId].sender.destroy();
        this.peerConnections[peerId].receiver.destroy();
        this.peerConnections[peerId] = null;
    }

    componentDidUpdate(prevProps) {
        if (this.props.roomName !== prevProps.roomName) {
            // room changed. join the new room
            this.joinRoom();
        }
    }

    render() {
        return <pre>{JSON.stringify(this.state, null, 2)}</pre>
    }
}

PeersProvider.propTypes = {
    roomName: PropTypes.string,
    selfVideo: videoData,
};

PeersProvider.defaultProps = {
    roomName: 'test-1'
};

export default PeersProvider;

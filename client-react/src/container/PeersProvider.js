import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import { videoData } from '../utils/types';
import {
    ROOM_JOIN_REQUEST,
    PEER_LEFT_ROOM,
} from '../common/socket-io-events';
import { removeInArray } from '../common/utils';

// socket.io client events are documented - https://github.com/socketio/socket.io-client/blob/master/docs/API.md
// todo:
// 1. handle (or atleast log) the disconnect event as described in https://github.com/socketio/socket.io-client/blob/master/docs/API.md#event-disconnect

// Notes:
// 1. Two reconnection attempts take around 5 secs. If reconnection fails after 2 attempts show error to the user. 

const SOCKET_IO_SERVER_URL = '2635d75c.ngrok.io';

class PeersProvider extends Component {
    state = {
        isConnected: false,
        numConnectionAttempts: 0,
        peers: null,
    };

    constructor(props) {
        super(props);      
        this.socket = io(SOCKET_IO_SERVER_URL);

        this.socket.on('connect', () => {
            this.joinRoom();
        })

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
            console.log("--> peer left room : ", peerId);
            // todo: clean any state / variables associated with this peer
            this.setState(prevState => ({
                peers: removeInArray(prevState.peers, peerId)
            }));
        })
    }

    joinRoom() {
        // todo: clean any state / variables connected with individual peers
        this.setState({
            isConnected: false,
            numConnectionAttempts: 0,
            peers: null,
        });
        this.socket.emit(ROOM_JOIN_REQUEST, this.props.roomName, (err, peers) => {
            // todo: handle/ log err
            // got list of connected peers here
            // do stuff with it
            this.setState({
                isConnected: true,
                peers,
            });
        });
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

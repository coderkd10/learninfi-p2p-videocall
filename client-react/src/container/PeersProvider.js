import React, { Component } from 'react';
import PropTypes from 'prop-types';
import io from 'socket.io-client';
import { videoData } from '../utils/types';
import {
    ROOM_JOIN_REQUEST,
} from '../common/socket-io-events';

// socket.io client events are documented - https://github.com/socketio/socket.io-client/blob/master/docs/API.md
// todo:
// 1. handle (or atleast log) the disconnect event as described in https://github.com/socketio/socket.io-client/blob/master/docs/API.md#event-disconnect

// Notes:
// 1. Two reconnection attempts take around 5 secs. If reconnection fails after 2 attempts show error to the user. 

const SOCKET_IO_SERVER_URL = '1b859762.ngrok.io';

class PeersProvider extends Component {
    state = {
        peers: null,
    };

    constructor(props) {
        super(props);
        this.socket = io(SOCKET_IO_SERVER_URL);
        // todo: setup connect, disconnect listener here if required
        this.socket.on('connect', () => {
            console.log("--> connected : ", this.socket.id);
        })
        this.socket.on('connect_error', err => {
            console.log("--> connect_error occured - ", err);
        });
        this.socket.on('connect_timeout', (timeout) => {
            // when does this occur?
            console.log("--> connect timeout occured - ", timeout);
        });
        this.socket.on('error', (error) => {
            // todp: log this to the server
            console.log("--> some error occured - ", error);
        });
        this.socket.on('disconnect', (reason) => {
            console.log("--> disconnected - ", reason);
        });
        this.socket.on('reconnect', (attemptNumber) => {
            console.log("--> reconnected after attempt - ", attemptNumber);
        });
        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('--> reconnect_attempt - ', attemptNumber);
        });
        this.socket.on('reconnecting', (attemptNumber) => {
            console.log('--> reconnecting - ', attemptNumber);
        });
        this.socket.on('reconnect_error', (error) => {
            console.log('--> reconnect_error - ', error);
        });
        this.socket.on('reconnect_failed', () => {
            // this will never occur since we haven't set a reconnectionAttempts
            // and its default value is infinity
            console.log('--> reconnect failed')
          });

        this.joinRoom();
    }

    joinRoom() {
        this.socket.emit(ROOM_JOIN_REQUEST, this.props.roomName, (err, peers) => {
            // got list of connected peers here
            // do stuff with it
            console.log("connected peers ->", peers);
            this.setState({
                peers,
            });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.roomName !== prevProps.roomName) {
            this.joinRoom();
        }
    }

    render() {
        return <pre>{this.state.peers && this.state.peers.join(',\n')}</pre>
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

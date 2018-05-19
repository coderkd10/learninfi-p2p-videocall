// Inspired from https://github.com/mozmorris/react-webcam/blob/master/src/react-webcam.js
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import LocalStreamCache from '../stores/LocalStreamCache';
import ErrorContainer from './error';

export default class Webcam extends Component {
    state = {
        showErrorDialog: false,
        err: null,
        showLoading: true,
        stream: null
    };
    streamCache = new LocalStreamCache();
    
    updateStream(audio, video) {
        if (!this.state.stream) {
            this.setState({ showLoading: true });
        }
        this.streamCache.getStream(audio, video)
        .then(stream => {
            this.setState({
                showErrorDialog: false,
                err: null,
                showLoading: false,
                stream: {
                    hasAudio: audio,
                    hasVideo: video,
                    streamObj: stream
                }
            });
        })
        .catch(err => {
            this.setState({
                showErrorDialog: true,
                err,
                showLoading: false,
                stream: null
            });
            // todo: log this error to backend in case
            // it is not a permission error
        });
    }

    componentDidMount() {
        this.updateStream(this.props.audio, this.props.video);
    }

    componentDidUpdate(prevProps) {
        if (this.props.audio !== prevProps.audio || this.props.video !== prevProps.video) {
            this.updateStream(this.props.audio, this.props.video);
        }
    }

    componentWillUnmount() {
        this.streamCache.cleanup();
    }

    onNoVideoConfirm = () => {
        this.setState({
            showErrorDialog: false
        });
    }

    onRetry = () => {
        // todo: on retry check if we still have the error
        // if yes show another dialog, informing the user
        // if they have granted permission they may have to
        // reload the page for the permissions to take effect.
        this.updateStream(this.props.audio, this.props.video);
    }

    render() {
        const { err, showLoading, stream } = this.state;
        return <Fragment>
            {this.props.children({
                err,
                showLoading,
                stream,
            })}
            {this.state.showErrorDialog ? (
                <ErrorContainer 
                    open={true}
                    err={this.state.err}
                    onRetry={this.onRetry}
                    onNoVideoConfirm={this.onNoVideoConfirm}
                />): 
                null
            }
        </Fragment>
    }
};

Webcam.propTypes = {
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired,
    children: PropTypes.func.isRequired,
};

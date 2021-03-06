import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import VideoPlayer from '../presentational/VideoPlayer';
import AutoplayErrorContainer from './error/AutoplayErrorContainer';
import cancelifyPromise, { CANCELED_PROMISE_EXCEPTION_NAME } from '../shared/cancelifyPromise';
import { isStreamsEqual } from '../utils/media-stream-utils';

const DEFAULT_ASPECT_RATIO = 4/3; //some random default value initially

const playVideo = (videoElement, stream) => {
    // videoElement is a html5 video element
    // this function tries to play given stream in that element
    if (!stream.hasAudio && !stream.hasVideo) {
        return Promise.resolve();
    }
    videoElement.srcObject = stream.streamObj;
    return videoElement.play();
}

class VideoContainer extends Component {
    state = {
        videoLoading: true,
        videoAspectRatio: DEFAULT_ASPECT_RATIO, 
        autoplayError: false,
        requestAutoplayErrorDialog: false,
    }

    componentDidMount() {
        this.tryPlayingVideo();
    }

    componentDidUpdate(prevProps) {
        if (!isStreamsEqual(this.props.stream, prevProps.stream)) {
            this.tryPlayingVideo();
        }
    }

    getVideoAspectRatio() {
        const { videoWidth, videoHeight } = this.video;        
        if (!videoHeight)
            return DEFAULT_ASPECT_RATIO;
        return videoWidth / videoHeight;
    }

    tryPlayingVideo = () => {
        const { showLoading, showError, stream } = this.props;
        if (!stream) {
            // if we don't have a stream object then nothing more to do
            return;
        }

        if (!showLoading && !showError && stream) {
            this.setState({
                videoLoading: true,
                autoplayError: false,
                requestAutoplayErrorDialog: false,
            });

            if (this.playPromise) {
                this.playPromise.cancel();
            }
            this.playPromise = cancelifyPromise(playVideo(this.video, stream));
            this.playPromise
                .then(() => {
                    this.setState({
                        videoLoading: false,
                        videoAspectRatio: this.getVideoAspectRatio(),
                    });
                })
                .catch(err => {
                    if (err.name === CANCELED_PROMISE_EXCEPTION_NAME) {
                        // this was a previously canceled promise
                        return;
                    }
                    // todo: log this to the backend
                    this.setState({
                        videoLoading: false,
                        videoAspectRatio: this.getVideoAspectRatio(),
                        autoplayError: true,
                        requestAutoplayErrorDialog: true,
                    });
                });
        }
    }

    componentWillUnmount() {
        // cancel pending play promises when this component is about to unmount
        if (this.playPromise) {
            this.playPromise.cancel();
        }
    }

    videoRef = ref => {
        this.video = ref;
        this.props.videoRef && this.props.videoRef(ref);
    }

    render() {
        const { showLoading, showError, videoRef, ...otherProps } = this.props;
        return (
            <Fragment>
                <VideoPlayer
                    {...otherProps}
                    showLoading={showLoading || (!showError && this.state.videoLoading)}
                    showError={showError}
                    videoRef={this.videoRef}
                    videoAspectRatio={this.state.videoAspectRatio}
                    showOverlay={this.state.autoplayError}
                    onOverlayClick={this.tryPlayingVideo}
                />
                <AutoplayErrorContainer
                    requestOpen={this.state.requestAutoplayErrorDialog}
                    onClose={() => {
                        this.setState({ requestAutoplayErrorDialog: false });
                    }}
                />
            </Fragment>);
    }
}

VideoContainer.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    showLoading: PropTypes.bool,
    showError: PropTypes.bool,
    stream: PropTypes.shape({
        hasAudio: PropTypes.bool.isRequired,
        hasVideo: PropTypes.bool.isRequired,
        streamObj: PropTypes.object,
    }),
    videoRef: PropTypes.func,
};

VideoContainer.defaultProps = {
    width: 300,
    height: 200,
    showLoading: true,
    showError: false,
    stream: null,
    videoRef: null,
};

export default VideoContainer;

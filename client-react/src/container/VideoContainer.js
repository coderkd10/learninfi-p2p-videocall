import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import VideoPlayer from '../presentational/VideoPlayer';
import AutoplayErrorContainer from './error/AutoplayErrorContainer';

const DEFAULT_ASPECT_RATIO = 4/3; //some random default value initially

class VideoContainer extends Component {
    state = {
        videoLoading: true,
        videoAspectRatio: DEFAULT_ASPECT_RATIO, 
        autoplayError: false,
        requestAutoplayErrorDialog: false,
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.stream !== prevProps.stream) {
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
        if (!showLoading && !showError && stream) {
            this.setState({
                videoLoading: true,
                autoplayError: false,
                requestAutoplayErrorDialog: false,
            });
            this.video.srcObject = stream.streamObj;
            this.video.play()
                .then(() => {
                    this.setState({
                        videoLoading: false,
                        videoAspectRatio: this.getVideoAspectRatio(),
                    });
                })
                .catch(() => {
                    this.setState({
                        videoLoading: false,
                        videoAspectRatio: this.getVideoAspectRatio(),
                        autoplayError: true,
                        requestAutoplayErrorDialog: true,
                    });
                });
        }
    }

    render() {
        const { showLoading, showError, ...otherProps } = this.props;
        return (
            <Fragment>
                <VideoPlayer
                    {...otherProps}
                    showLoading={showLoading || (!showError && this.state.videoLoading)}
                    showError={showError}
                    videoRef={ref => {this.video = ref;}}
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
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    showLoading: PropTypes.bool,
    showError: PropTypes.bool,
    stream: PropTypes.shape({
        hasAudio: PropTypes.bool.isRequired,
        hasVideo: PropTypes.bool.isRequired,
        streamObj: PropTypes.object.isRequired,
    }),
};

VideoContainer.defaultProps = {
    showLoading: true,
    showError: false,
    stream: null,
};

export default VideoContainer;

import React from 'react';
import PropTypes from 'prop-types';
import PeersArea from './PeersArea';
import ToolsContainer from './ToolsContainer';
import Webcam from '../container/Webcam';
import VideoContainer from '../container/VideoContainer';
import styles from './App.module.css';

const BORDER_SIZE = 1;
const TOOLS_CONTAINER_MAX_HEIGHT = 39;
const VIDEO_PADDING = 5;

const App = ({
    width,
    height,
    style,
    captureAudio,
    captureVideo,
}) => {
    const innerWidth = width - 2*BORDER_SIZE;
    const innerHeight = height - 2*BORDER_SIZE;
    const peersAreaHeight = 0.3*innerHeight;
    const toolsContainerHeight = Math.min(TOOLS_CONTAINER_MAX_HEIGHT, 0.15*innerHeight);
    const videoContainerHeight = innerHeight - (peersAreaHeight + toolsContainerHeight + VIDEO_PADDING);
    const videoContainerWidth = innerWidth - 2*VIDEO_PADDING;

    return (
        <div className={styles.container} style={{
            width,
            height,
            border: `${BORDER_SIZE}px solid #bdbdbd`,
            ...style
        }}>
            <PeersArea 
                width={innerWidth}
                height={peersAreaHeight}
            />
            <div style={{
                paddingTop: VIDEO_PADDING,
                paddingLeft: VIDEO_PADDING,
                paddingRight: VIDEO_PADDING,
            }}>
                <Webcam
                    audio={captureAudio}
                    video={captureVideo}
                >
                {
                    ({
                    err,
                    showLoading,
                    stream  
                    }) => (
                        <VideoContainer
                            width={videoContainerWidth}
                            height={videoContainerHeight}
                            showLoading={showLoading}
                            showError={Boolean(err)}
                            stream={stream}
                        />)
                }
                </Webcam>
            </div>
            <ToolsContainer
                width={innerWidth}
                height={toolsContainerHeight}
                minHorizontalPadding={0.2*innerWidth}
                minVerticalPadding={0.125*toolsContainerHeight}
            />
        </div>);
};

App.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    style: PropTypes.object,
    captureAudio: PropTypes.bool.isRequired,
    captureVideo: PropTypes.bool.isRequired,
};

App.defaultProps = {
    width: 300,
    height: 364,
    style: {},
};

export default App;

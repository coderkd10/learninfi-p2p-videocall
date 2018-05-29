import React from 'react';
import PropTypes from 'prop-types';
import PeersArea from './peersArea';
import ToolsContainer from './ToolsContainer';
import VideoContainer from '../container/VideoContainer';
import { videoData } from '../utils/types';
import styles from './App.module.css';

const BORDER_SIZE = 1;
const TOOLS_CONTAINER_MAX_HEIGHT = 39;
const VIDEO_PADDING = 5;

const checkHasAudio = videoData => {
    const { stream } = videoData;
    if (!stream)
        return false;
    return stream.hasAudio;
}

const App = ({
    width,
    height,
    style,
    captureAudio,
    captureVideo,
    connectionStatus,
    isOnline,
    peerVideos,
    lastClickedPeerIndex,
    onPeerVideoClick,
    onWebcamButtonClick,
    onMicButtonClick,
    isMutedMap,
    handleTogglePeerVolume,
}) => {
    const innerWidth = width - 2*BORDER_SIZE;
    const innerHeight = height - 2*BORDER_SIZE;
    const peersAreaHeight = 0.3*innerHeight;
    const toolsContainerHeight = Math.min(TOOLS_CONTAINER_MAX_HEIGHT, 0.15*innerHeight);
    const videoContainerHeight = innerHeight - (peersAreaHeight + toolsContainerHeight + VIDEO_PADDING);
    const videoContainerWidth = innerWidth - 2*VIDEO_PADDING;

    // video to show in the main area
    // note: this component assumes that the lastClickedPeerIndex is in the correct range [0, ..., num peers -1]
    // if this not the case we might get some weird behavior
    // todo: enforce this invariant somehow in the code and log to the server if it is ever broken.
    const mainPeerId = peerVideos[lastClickedPeerIndex].peerId;
    const mainVideoData = peerVideos[lastClickedPeerIndex].videoData;
    const mainHasAudio = checkHasAudio(mainVideoData);
    const mainIsMuted = Boolean(isMutedMap[mainPeerId]);

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
                connectionStatus={connectionStatus}
                isOnline={isOnline}
                peerVideos={peerVideos}
                onPeerVideoClick={onPeerVideoClick}
                isMutedMap={isMutedMap}
            />
            <div style={{
                paddingTop: VIDEO_PADDING,
                paddingLeft: VIDEO_PADDING,
                paddingRight: VIDEO_PADDING,
            }}>
                <VideoContainer
                    width={videoContainerWidth}
                    height={videoContainerHeight}
                    isMuted={mainIsMuted}
                    {...mainVideoData}
                />
            </div>
            <ToolsContainer
                width={innerWidth}
                height={toolsContainerHeight}
                minHorizontalPadding={0.2*innerWidth}
                minVerticalPadding={0.125*toolsContainerHeight}
                isWebcamOn={captureVideo}
                onWebcamButtonClick={onWebcamButtonClick}
                isMicOn={captureAudio}
                onMicButtonClick={onMicButtonClick}
                isVolumeButtonEnabled={mainHasAudio}
                isVolumeOn={!mainIsMuted}
                onVolumeButtonClick={() => handleTogglePeerVolume(mainPeerId)}
            />
        </div>);
};

App.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    style: PropTypes.object,
    captureAudio: PropTypes.bool.isRequired,
    captureVideo: PropTypes.bool.isRequired,
    connectionStatus: PropTypes.string.isRequired,
    isOnline: PropTypes.bool.isRequired,
    peerVideos: PropTypes.arrayOf(PropTypes.shape({
        peerId: PropTypes.string.isRequired,
        videoData
    })).isRequired,
    lastClickedPeerIndex: PropTypes.number.isRequired,
    onPeerVideoClick: PropTypes.func.isRequired,
    onWebcamButtonClick: PropTypes.func.isRequired,
    onMicButtonClick: PropTypes.func.isRequired,
    isMutedMap: PropTypes.objectOf(PropTypes.bool).isRequired,
    handleTogglePeerVolume: PropTypes.func.isRequired,
};

App.defaultProps = {
    width: 300,
    height: 364,
    style: {},
};

export default App;

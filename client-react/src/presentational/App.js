import React from 'react';
import PropTypes from 'prop-types';
import PeersArea from './peersArea';
import ToolsContainer from './ToolsContainer';
import VideoContainer from '../container/VideoContainer';
import { videoData } from '../utils/types';
import styles from './App.module.css';
import { SELF_PEER_KEY } from '../constants';

const BORDER_SIZE = 1;
const TOOLS_CONTAINER_MAX_HEIGHT = 39;
const VIDEO_PADDING = 5;

const getMainVideo = (lastClickedPeer, peerVideos) => {
    const filtered = peerVideos.filter(({ peerId }) => peerId === lastClickedPeer);
    if (filtered.length === 0) {
        // can this happen?
        // todo: think / log the cases when / where this happens
        if (lastClickedPeer === SELF_PEER_KEY) {
            // should not happen at all since it => that self video is not present in
            // peers list
            throw new Error('Invariant broken : peer videos does not have self video');
        }
        return getMainVideo(SELF_PEER_KEY, peerVideos);
    }
    return filtered[0].videoData;
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
    lastClickedPeer,
    onPeerVideoClick,
    onWebcamButtonClick,
    onMicButtonClick,
}) => {
    const innerWidth = width - 2*BORDER_SIZE;
    const innerHeight = height - 2*BORDER_SIZE;
    const peersAreaHeight = 0.3*innerHeight;
    const toolsContainerHeight = Math.min(TOOLS_CONTAINER_MAX_HEIGHT, 0.15*innerHeight);
    const videoContainerHeight = innerHeight - (peersAreaHeight + toolsContainerHeight + VIDEO_PADDING);
    const videoContainerWidth = innerWidth - 2*VIDEO_PADDING;

    // to show in the main area
    const mainVideo = getMainVideo(lastClickedPeer, peerVideos);

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
            />
            <div style={{
                paddingTop: VIDEO_PADDING,
                paddingLeft: VIDEO_PADDING,
                paddingRight: VIDEO_PADDING,
            }}>
                <VideoContainer
                    width={videoContainerWidth}
                    height={videoContainerHeight}
                    {...mainVideo}
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
    lastClickedPeer: PropTypes.string.isRequired,
    onPeerVideoClick: PropTypes.func.isRequired,
    onWebcamButtonClick: PropTypes.func.isRequired,
    onMicButtonClick: PropTypes.func.isRequired,
};

App.defaultProps = {
    width: 300,
    height: 364,
    style: {},
};

export default App;

import { connectionStates } from '../constants';
import {
    hasAudio as checkHasAudio,
    hasVideo as checkHasVideo
} from '../utils/media-stream-utils';

const isPeerConnecting = (connectionStatus) => {
    if (!connectionStatus)
        return false;
    const { sender, receiver } = connectionStatus;
    return sender !== connectionStates.DISCONNECTED &&
        receiver !== connectionStates.DISCONNECTED;
}

const shouldShowLoadingVideoData = (connectionStatus) => {
    if (isPeerConnecting(connectionStatus)) {
        return {
            showLoading: true,
            showError: false,
            stream: null
        };
    }
    return null;
}

const getPeerVideoData = (connectionStatus, videoMetadata, streamObj) => {
    if (videoMetadata) {
        const { showLoading, showError, stream } = videoMetadata;
        if (showLoading || showError) {
            return {
                showLoading,
                showError,
                stream: null,
            };
        }
        if (!stream) {
            // can this happen ? no loading / stream yet no stream in metadata ?
            // todo: log this to the backend
            return null;
        }
        const { hasAudio, hasVideo } = stream;
        if ((!hasAudio && !hasVideo) || streamObj) {
            return {
                showLoading,
                showError,
                stream: {
                    hasAudio,
                    hasVideo,
                    streamObj,
                },
            };
        }
        // we have a audio / video in stream but the stream object hasn't arrived
        return shouldShowLoadingVideoData(connectionStatus);
    }
    else if(streamObj) {
        // stream obj has arrived but no metadata yet
        // i think this case is highly unlikely
        // todo: the number of times this case occurs in reality
        const hasAudio = checkHasAudio(streamObj);
        const hasVideo = checkHasVideo(streamObj);
        return {
            showLoading: false,
            showError: false,
            stream: {
                hasAudio,
                hasVideo,
                streamObj,
            },
        };
    }
    // if we don't have a video metadata / stream object then we have decided to
    // not show it in the peer list
    // todo: review this decision later
    // idea1: maybe initially we can show this peer in the peer list
    // but if either the metadata / stream does not appear with some timeout (say 300/500ms)
    // then don't show it in peers list
    // return shouldShowLoadingVideoData(connectionStatus);
    return null;
}

const peerStateFormatter = ({
    peers, // list of peers
    peerConnectionStatus, // map containing connection status
    peerVideoMetadata, // map containing video metadata
    peerStreamObj, // map containing strem objs
}) => (
    peers
    .map(peerId => ({
        peerId,
        videoData: getPeerVideoData(
            peerConnectionStatus[peerId],
            peerVideoMetadata[peerId],
            peerStreamObj[peerId]            
        )
    }))
    .filter(({ peerId, videoData }) => !!videoData)
);

export default peerStateFormatter;

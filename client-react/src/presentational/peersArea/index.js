import React from 'react';
import Indicator from './PeersAreaIndicator';
import PeerVideos from './PeerVideos';

const PeersArea = ({
    width,
    height,
    connectionStatus,
    isOnline,
    peerVideos,
    onPeerVideoClick,
    isMutedMap
})=> (peerVideos && peerVideos.length >= 2) ?
    (<PeerVideos width={width} height={height}
        peerVideos={peerVideos}
        onPeerVideoClick={onPeerVideoClick}
        isMutedMap={isMutedMap}
    />):
    (<Indicator width={width} height={height}
        connectionStatus={connectionStatus}
        isOnline={isOnline}
    />);

export default PeersArea;

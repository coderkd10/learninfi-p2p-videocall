import React from 'react';
import Indicator from './PeersAreaIndicator';
import PeerVideos from './PeerVideos';

const PeersArea = ({
    width,
    height,
    connectionStatus,
    isOnline,
    peerVideos
})=> (peerVideos && peerVideos.length >= 2) ?
    <PeerVideos width={width} height={height} peerVideos={peerVideos} />:
    <Indicator width={width} height={height}
        connectionStatus={connectionStatus}
        isOnline={isOnline}
    />;

export default PeersArea;

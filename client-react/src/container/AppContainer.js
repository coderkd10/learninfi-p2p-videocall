import React, { Component } from 'react';
import { observer } from 'mobx-react';
import appState from '../stores/AppState';
import AppUI from '../presentational/App';
import PeersProvider from './PeersProvider';
import Webcam from './Webcam';
import OfflineProvider from '../shared/OfflineProvider';
import { connectionStates } from '../constants';
import { SELF_PEER_KEY } from '../constants';

const getConnectionStatus = (isConnected, numAttempts) => {
    if (isConnected)
        return connectionStates.CONNECTED;
    if (numAttempts < 2)
        return connectionStates.CONNECTING;
    return connectionStates.DISCONNECTED;
}

@observer
class AppContainer extends Component {
    state = {
        lastClickedPeer: null, // implies that we haven't clicked on a peer yet
        isMutedMap: {
            [SELF_PEER_KEY]: true, // at the start ensure that self video is muted
        }, // keeps track if peer is muted
    };

    onPeerVideoClick = peerId => {
        this.setState({
            lastClickedPeer: peerId,
        })
    };

    getLastClickedPeerIndex = peerVideos => {
        const { lastClickedPeer } = this.state;
        if (!lastClickedPeer) {
            // no peer was clicked ever
            // so we'll simply show the first on the list in this case
            return 0;
        }

        let i;
        for(i=0; i < peerVideos.length; i++) {
            if (peerVideos[i].peerId === lastClickedPeer)
                break;
        }
        if (i < peerVideos.length) {
            // the peer that was clicked still exists in the peerVideos array
            return i;
        }
        // the peer that was last clicked no longer exists in the peerVideos array
        // i.e. - it must have been removed from the peer videos array
        // we'll show the first peer in this case
        return 0;
    }

    togglePeerVolume = peerId => {
        this.setState(prevState => ({
            isMutedMap: {
                ...prevState.isMutedMap,
                [peerId]: !prevState.isMutedMap[peerId],
            },
        }));
    }

    render() {
        return (
            <Webcam
                audio={appState.captureAudio}
                video={appState.captureVideo}
            >
            {selfVideo =>
                <PeersProvider selfVideo={selfVideo}>
                {({ isConnected, numConnectionAttempts, peerVideos }) => {
                    // append self video at the end of peer videos array
                    peerVideos = [
                        ...(peerVideos || []),
                        {
                            peerId: SELF_PEER_KEY,
                            videoData: selfVideo
                        },
                    ];

                    return (<AppUI
                        captureAudio={appState.captureAudio}
                        captureVideo={appState.captureVideo}
                        connectionStatus={getConnectionStatus(isConnected, numConnectionAttempts)}
                        isOnline={this.props.isOnline}
                        peerVideos={peerVideos}
                        lastClickedPeerIndex={this.getLastClickedPeerIndex(peerVideos)}
                        onPeerVideoClick={this.onPeerVideoClick}
                        onWebcamButtonClick={() => {
                            appState.captureVideo = !appState.captureVideo;
                        }}
                        onMicButtonClick={() => {
                            appState.captureAudio = !appState.captureAudio;
                        }}
                        isMutedMap={this.state.isMutedMap}
                        handleTogglePeerVolume={this.togglePeerVolume}
                    />);
                }}
                </PeersProvider>
            }
            </Webcam>);
    }
}

const WithOfflineDetection = () => (
    <OfflineProvider>
    {({ isOnline }) =>
        <AppContainer isOnline={isOnline} />
    }
    </OfflineProvider>);

export default WithOfflineDetection;

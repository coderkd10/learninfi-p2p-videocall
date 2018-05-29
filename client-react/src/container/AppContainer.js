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
        lastClickedPeer: SELF_PEER_KEY,
    };

    onPeerVideoClick = peerId => {
        this.setState({
            lastClickedPeer: peerId,
        })
    };

    render() {
        return (
            <Webcam
                audio={appState.captureAudio}
                video={appState.captureVideo}
            >
            {selfVideo =>
                <PeersProvider selfVideo={selfVideo}>
                {({ isConnected, numConnectionAttempts, peerVideos }) =>
                    <AppUI
                        captureAudio={appState.captureAudio}
                        captureVideo={appState.captureVideo}
                        connectionStatus={getConnectionStatus(isConnected, numConnectionAttempts)}
                        isOnline={this.props.isOnline}
                        peerVideos={[
                            ...(peerVideos || []),
                            {
                                peerId: SELF_PEER_KEY,
                                videoData: selfVideo
                            },
                        ]}
                        lastClickedPeer={this.state.lastClickedPeer}
                        onPeerVideoClick={this.onPeerVideoClick}
                        onWebcamButtonClick={() => {
                            appState.captureVideo = !appState.captureVideo;
                        }}
                        onMicButtonClick={() => {
                            appState.captureAudio = !appState.captureAudio;
                        }}
                    />
                }
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

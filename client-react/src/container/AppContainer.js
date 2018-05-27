import React, { Component, Fragment } from 'react';
import { observer } from 'mobx-react';
import appState from '../stores/AppState';
import AppUI from '../presentational/App';

import PeersProvider from './PeersProvider';
import Webcam from './Webcam';
import VideoContainer from './VideoContainer';

@observer
class AppContainer extends Component {
    render() {
        // return (
        //     <AppUI
        //         {...this.props}
        //         captureAudio={appState.captureAudio}
        //         captureVideo={appState.captureVideo}
        //         onWebcamButtonClick={() => {
        //             appState.captureVideo = !appState.captureVideo;
        //         }}
        //         onMicButtonClick={() => {
        //             appState.captureAudio = !appState.captureAudio;
        //         }}
        //     />);
        return  (
            <Webcam
                audio={false}
                video={true}
            >
            {
                selfVideo =>
                    <Fragment>
                        <PeersProvider selfVideo={selfVideo}>
                        {
                            ({ id, isConnected, numConnectionAttempts, peerVideos }) => <Fragment>
                                <pre>{JSON.stringify({ id, isConnected, numConnectionAttempts, peerVideos }, null, 2)}</pre>
                                {peerVideos && peerVideos.map(({ peerId, videoData }) =>
                                    <VideoContainer 
                                        key={peerId}
                                        {...videoData}
                                    />
                                )}
                            </Fragment>
                        }
                        </PeersProvider>                    
                        <VideoContainer
                            {...selfVideo}
                        />
                    </Fragment>
            }
            </Webcam>);
    }
}

export default AppContainer;

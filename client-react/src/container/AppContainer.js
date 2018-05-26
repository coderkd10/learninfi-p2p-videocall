import React, { Component } from 'react';
import { observer } from 'mobx-react';
import appState from '../stores/AppState';
import AppUI from '../presentational/App';

import PeersProvider from './PeersProvider';
import Webcam from '../container/Webcam';

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
                audio={true}
                video={true}
            >
            {
                selfVideo =>
                    <PeersProvider selfVideo={selfVideo}/>
            }
            </Webcam>);
    }
}

export default AppContainer;

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import appState from '../stores/AppState';
import AppUI from '../presentational/App';

@observer
class AppContainer extends Component {
    render() {
        return (
            <AppUI
                {...this.props}
                captureAudio={appState.captureAudio}
                captureVideo={appState.captureVideo}
            />);
    }
}

export default AppContainer;

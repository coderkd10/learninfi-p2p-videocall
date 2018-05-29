import 'webrtc-adapter';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppContainer from './container/AppContainer';

const ThemedApp = () =>
  <MuiThemeProvider>
    <AppContainer />
  </MuiThemeProvider>

export default ThemedApp;

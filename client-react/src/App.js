import 'webrtc-adapter';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppContainer from './container/AppContainer';

const ThemedApp = props =>
  <MuiThemeProvider>
    <AppContainer {...props} />
  </MuiThemeProvider>

export default ThemedApp;

import 'webrtc-adapter';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppContainer from './container/AppContainer';
import { center } from './utils/style-utils.module.css';

import SlickDemo from './SlickDemo';

// todo: replace this with only themed app container
// when exporting this as a library and move the container
// with 100vw, 100vw to index.js
const App = () => 
  <div style={{
    width: '100vw',
    height: '100vh',
    background: '#dbdbdb'
  }}>
    <div className={center}>
      {/* <AppContainer /> */}
      <SlickDemo />
    </div>
  </div>

const ThemedApp = () =>
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>

export default ThemedApp;

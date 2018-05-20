import 'webrtc-adapter';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Webcam from './container/Webcam';
import VideoContainer from './container/VideoContainer';
import { center } from './utils/style-utils.module.css';

const App = () =>
  <Webcam 
    audio={true}
    video={true}
  >
  {
    ({
      err,
      showLoading,
      stream
    }) => (
      <div className={center}>
        <VideoContainer
          height={200}
          width={275}
          showLoading={showLoading}
          showError={Boolean(err)}
          stream={stream}
        />
      </div>
    )
  }
  </Webcam>

const ThemedApp = () =>
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>

export default ThemedApp;
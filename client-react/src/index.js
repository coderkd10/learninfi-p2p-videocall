import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// right now used a seemingly hacky way to export this video call as a independent
// react component.
// todo: try to find out if there are better ways to export
window.renderVideoCall = (domNode, roomName) => 
    ReactDOM.render(<App roomName={roomName} />, domNode);

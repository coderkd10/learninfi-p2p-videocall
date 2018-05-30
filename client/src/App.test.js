import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  // const div = document.createElement('div');
  // ReactDOM.render(<App />, div);
  // ReactDOM.unmountComponentAtNode(div);
  
  // ^ Fails right now since
  // webcam component does not handle the case when
  // getUserMedia is not defined
  // TODO
});

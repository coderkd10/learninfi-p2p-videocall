import React, { Component } from 'react';
import { observer } from 'mobx-react';
import appState from './stores/AppState';

@observer
class Todos extends Component {
    render() {
        return (
            <div>
                <h1>{appState.n}</h1>
                <button onClick={() => {
                    appState.n += 1;
                }}>+</button>
                <button onClick={() => {
                    appState.n -= 1;
                }}>-</button>
            </div>);
    }
}

export default Todos;

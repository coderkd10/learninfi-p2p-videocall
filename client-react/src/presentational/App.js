import React from 'react';
import PropTypes from 'prop-types';
import PeersArea from './PeersArea';
import styles from './App.module.css';

const App = ({
    width,
    height,
    style
}) => (
    <div className={styles.container} style={{
        width,
        height,
        ...style
    }}>
        <PeersArea 
            width={width}
            height={0.3*height}
        />
    </div>)

App.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    style: PropTypes.object,
};

App.defaultProps = {
    style: {},
};

export default App;

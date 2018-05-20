import React from 'react';
import PropTypes from 'prop-types';
import PeersArea from './PeersArea';
import ToolsContainer from './ToolsContainer';
import styles from './App.module.css';

const BORDER_SIZE = 1;

const App = ({
    width,
    height,
    style
}) => {
    const innerWidth = width - 2*BORDER_SIZE;
    const innerHeight = height - 2*BORDER_SIZE;
  
    return (
        <div className={styles.container} style={{
            width,
            height,
            border: `${BORDER_SIZE}px solid #bdbdbd`,
            ...style
        }}>
            <PeersArea 
                width={innerWidth}
                height={0.3*innerHeight}
            />
            <ToolsContainer
                width={innerWidth}
                height={39}
                minHorizontalPadding={0.2*innerWidth}
                minVerticalPadding={5}
            />
        </div>);
};

App.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    style: PropTypes.object,
};

App.defaultProps = {
    style: {},
};

export default App;

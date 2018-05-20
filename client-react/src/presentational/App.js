import React from 'react';
import PropTypes from 'prop-types';
import PeersArea from './PeersArea';
import ToolsContainer from './ToolsContainer';
import styles from './App.module.css';

const BORDER_SIZE = 1;
const TOOLS_CONTAINER_MAX_HEIGHT = 39;

const App = ({
    width,
    height,
    style
}) => {
    const innerWidth = width - 2*BORDER_SIZE;
    const innerHeight = height - 2*BORDER_SIZE;
    const peersAreaHeight = 0.3*innerHeight;
    const toolsContainerHeight = Math.min(TOOLS_CONTAINER_MAX_HEIGHT, 0.15*innerHeight);
    
    return (
        <div className={styles.container} style={{
            width,
            height,
            border: `${BORDER_SIZE}px solid #bdbdbd`,
            ...style
        }}>
            <PeersArea 
                width={innerWidth}
                height={peersAreaHeight}
            />
            <ToolsContainer
                width={innerWidth}
                height={toolsContainerHeight}
                minHorizontalPadding={0.2*innerWidth}
                minVerticalPadding={0.125*toolsContainerHeight}
            />
        </div>);
};

App.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    style: PropTypes.object,
};

App.defaultProps = {
    width: 300,
    height: 364,
    style: {},
};

export default App;

import React from 'react';
import PropTypes from 'prop-types';
import { Textfit } from 'react-textfit';
import classNames from 'classnames';
import { connectionStates } from '../../constants';
import styles from './PeersArea.module.css';
import { center } from '../../utils/style-utils.module.css';

const YELLOW_DOT_COLOR = '#fac600';    
const GREEN_DOT_COLOR = '#009f00';
const RED_DOT_COLOR = '#ff0000';

const Dot = ({
    width,
    height,
    color=YELLOW_DOT_COLOR,
    ...otherProps
}) => (
    <div
        {...otherProps}    
        style={{
            width,
            height,
            backgroundColor: color,
            borderRadius: '50%',
            display: 'inline-block',
        }}
    />);

const dotColorMapping = {
    [connectionStates.CONNECTING]: YELLOW_DOT_COLOR,
    [connectionStates.CONNECTED]: GREEN_DOT_COLOR,
    [connectionStates.DISCONNECTED]: RED_DOT_COLOR,
};

const getText = ({ connectionStatus, isOnline }) => {
    switch(connectionStatus) {
        case connectionStates.CONNECTING: return 'Trying to connect with server';
        case connectionStates.CONNECTED: return 'Waiting for participants to join';
        case connectionStates.DISCONNECTED: return isOnline ?
            'Server temporarily unreachable':
            "You aren't connected to internet"
        default: throw new Error('invalid connection status');
    }
}

// todo: the dot may not fit on all width and the peers container may break on very small
// width (~ < 90 - 100px) and very small heights. if the need arrises fix on these small
// dimensions.
const PeersAreaIndicator = ({
    width,
    height,
    connectionStatus,
    isOnline,
}) => (
    <div className={styles.container} style={{
        width,
        height,
    }}>
        <div className={classNames(center, styles.waitingText)} style={{
            width: 0.75*width,
            height: 0.5*height,
            lineHeight: `${0.5*height}px`,
            textAlign: 'center',
        }}>
            <div style={{
                position: "relative",
                left: 4
            }}>
                <Textfit mode="single" forceSingleModeWidth={false}>
                    {getText({ connectionStatus, isOnline })}
                </Textfit>
            </div>
            <div style={{
                width: 20,
                height: 0.5*height,
                position: "absolute",
                top: 0,
                left: -20,
            }}>
                <Dot
                    className={center}
                    width={13}
                    height={13}
                    color={dotColorMapping[connectionStatus]}
                />
            </div>
        </div>
    </div>);

PeersAreaIndicator.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    connectionStatus: PropTypes.string,
    isOnline: PropTypes.bool,
};

PeersAreaIndicator.defaultProps = {
    connectionStatus: connectionStates.CONNECTING,
    isOnline: true,
};

export default PeersAreaIndicator;

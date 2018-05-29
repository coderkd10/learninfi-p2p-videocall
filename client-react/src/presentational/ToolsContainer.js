import React from 'react';
import PropTypes from 'prop-types';
import WebcamOnIcon from 'react-icons/lib/md/videocam';
import WebcamOffIcon from 'react-icons/lib/md/videocam-off';
import MicOnIcon from 'react-icons/lib/md/mic';
import MicOffIcon from 'react-icons/lib/md/mic-off';
import VolumeDisabledIcon from 'react-icons/lib/md/volume-off';
import VolumeUpIcon from 'react-icons/lib/md/volume-up';
import VolumeMuteIcon from 'react-icons/lib/md/volume-mute';
import FullScreenIcon from 'react-icons/lib/fa/expand';
import computeDimensions from '../utils/size-utils';
import { center } from '../utils/style-utils.module.css';
import styles from './ToolsContainer.module.css';

const BUTTON_WIDTH = 34;
const BUTTON_HEIGHT = 29;
const ICON_SIZE = 16;
const BUTTONS_SPACING = 5;

const Icon = ({
    Svg
}) => (
    <Svg
        style={{
            width: ICON_SIZE,
            height: ICON_SIZE
        }}
    />);

const getButtonsArray = ({
    isWebcamOn,
    onWebcamButtonClick,
    isMicOn,
    onMicButtonClick,
    isVolumeButtonEnabled,
    isVolumeOn,
    onVolumeButtonClick,
    isFullScreenEnabled,
    onFullScreenButtonClick,
}) => {
    const buttonStyle = {
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        marginRight: BUTTONS_SPACING,
    };
    return [
        <button
            key="webcam"
            title={isWebcamOn? 'Turn webcam off': 'Turn webcam on'}
            onClick={onWebcamButtonClick}
            className={styles.button}
            style={buttonStyle}            
        >
            <Icon Svg={isWebcamOn? WebcamOffIcon: WebcamOnIcon}/>
        </button>,
        <button
            key="mic"
            title={isMicOn? 'Turn microphone off': 'Turn microphone on'}
            onClick={onMicButtonClick}
            className={styles.button}
            style={buttonStyle}            
        >
            <Icon Svg={isMicOn? MicOffIcon: MicOnIcon}/>
        </button>,
        <button
            key="volume"
            disabled={!isVolumeButtonEnabled}
            title={!isVolumeButtonEnabled? '':
                isVolumeOn?
                    "Mute current peer's volume":
                    "Unmute current peer's volume"
            }
            className={styles.button}
            style={buttonStyle}
            onClick={onVolumeButtonClick}
        >
            <Icon Svg={!isVolumeButtonEnabled? VolumeDisabledIcon:
                isVolumeOn? VolumeMuteIcon: VolumeUpIcon
            } />
        </button>,
        <button
            key="fullscreen"
            disabled={!isFullScreenEnabled}
            title={isFullScreenEnabled? 'Full screen current video': ''}
            className={styles.button}
            style={{
                ...buttonStyle,
                marginRight: 0
            }}
        >
            <Icon Svg={FullScreenIcon} />
        </button>
    ];
}

const ToolsContainer = ({
    width,
    height,
    minVerticalPadding,
    minHorizontalPadding,
    ...otherProps
}) => {
    const buttonsArray = getButtonsArray(otherProps);
    const arrayHeight = BUTTON_HEIGHT;
    const arrayWidth = buttonsArray.length * (BUTTON_WIDTH + BUTTONS_SPACING) - BUTTONS_SPACING;
    const { width: scaledArrayWidth, height: scaledArrayHeight } = computeDimensions({
        aspectRatio: arrayWidth / arrayHeight,
        maxWidth: width - 2*minHorizontalPadding,
        maxHeight: height - 2*minVerticalPadding,
    });

    return (
        <div className={styles.container} style={{
            width,
            height
        }}>
            <div className={center} style={{
                width: scaledArrayWidth,
                height: scaledArrayHeight,
            }}>
                <div style={{
                    whiteSpace: 'nowrap',
                    transformOrigin: '0 0',
                    transform: `scale(${scaledArrayWidth / arrayWidth})`
                }}>
                    {buttonsArray}
                </div>
            </div>
        </div>);
};

ToolsContainer.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    minVerticalPadding: PropTypes.number,
    minHorizontalPadding: PropTypes.number,
    isWebcamOn: PropTypes.bool,
    onWebcamButtonClick: PropTypes.func,
    isMicOn: PropTypes.bool,
    onMicButtonClick: PropTypes.func,
    isVolumeButtonEnabled: PropTypes.bool,
    isVolumeOn: PropTypes.bool,
    onVolumeButtonClick: PropTypes.func,
    isFullScreenEnabled: PropTypes.bool,
    onFullScreenButtonClick: PropTypes.func,
};

ToolsContainer.defaultProps = {
    minVerticalPadding: 5,
    minHorizontalPadding: 5,
    isWebcamOn: true,
    onWebcamButtonClick: () => {},
    isMicOn: true,
    onMicButtonClick: () => {},
    isVolumeButtonEnabled: true,
    isVolumeOn: true,
    onVolumeButtonClick: () => {},
    isFullScreenEnabled: true,
    onFullScreenButtonClick: () => {},
};

export default ToolsContainer;

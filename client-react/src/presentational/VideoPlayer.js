import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ScaleLoader from 'react-spinners/dist/spinners/ScaleLoader';
import ErrorIcon from 'react-icons/lib/md/error';
import PlayIcon from 'react-icons/lib/fa/play';
import UserIcon from 'react-icons/lib/fa/user';
import VolumeOffIcon from 'react-icons/lib/md/volume-off';
import VolumeUpIcon from 'react-icons/lib/md/volume-up';
import computeDimensions from '../utils/size-utils';
import { center } from '../utils/style-utils.module.css';
import styles from './VideoPlayer.module.css';

const VolumeIconContainer = ({
    isVolumeOn,
    containerWidth,
    containerHeight,
    style
}) => {
    const { width, height } = computeDimensions({
        aspectRatio: 1,
        maxWidth: 0.1*containerWidth,
        maxHeight: 0.35*containerHeight,
    });
    const Icon = isVolumeOn ? VolumeUpIcon: VolumeOffIcon;
    return (
        <Icon
            className={styles.volumeOffIcon}
            style={{
                width,
                height,
                top: 0.5*width,
                right: 0.5*height,
                ...style
            }}
        />);
}

const VideoPlayer = ({
    width,
    height,
    showLoading, // forces showing loading
    showError,
    stream,
    videoRef,
    videoAspectRatio,
    showOverlay,
    onOverlayClick,
    onClick,
}) => (
    <div className={styles.videoContainer}
        style={{
            width,
            height,
        }}
        onClick={onClick}
    >
        {showError ?
            (<div className={classNames(styles.errorContainer, center)}>
                <ErrorIcon
                    className={styles.errorIcon}
                    style={
                        computeDimensions({
                            aspectRatio: 1,
                            maxWidth: 0.4*width,
                            maxHeight: 0.4*height
                        })
                    }
                />
                <div className={styles.errorText}>
                    Unable to load video
                </div>
            </div>) :null
        }
        {/* we show loading if loading state is set externally
        or we don't have a stream prop yet */}
        {/* todo: this loader does not look good for very small video container size - handle this */}
        {showLoading || (!showError && !stream) ?
            (<div className={center}>
                <ScaleLoader 
                    height={0.125*height}
                    margin='2px'
                    radius={2}
                    width={0.02*height}
                />
            </div>) : null
        }
        {stream ?
            (<div style={{
                // not using visibility since visibility has a edge case
                // even if this is hidden but child's visibility is
                // explicitly set the it (child) will still be visible
                display: (showLoading || showError) ? 'none': 'block',
            }}>
                <div className={styles.overlay} 
                    style={{
                        visibility: showOverlay ? 'visible': 'hidden'
                    }}
                    onClick={onOverlayClick}
                >
                    <PlayIcon
                        className={classNames(styles.playIcon, center)}
                        style={
                            computeDimensions({
                                aspectRatio: 1,
                                maxWidth: 0.2*width,
                                maxHeight: 0.5*height
                            })
                        }
                    />
                </div>
                <UserIcon
                    className={classNames(styles.userIcon, center)}
                    style={{
                        ...computeDimensions({
                            aspectRatio: 1,
                            maxWidth: 0.5*width,
                            maxHeight: 0.85*height
                        }),
                        visibility: stream.hasVideo ? 'hidden': 'visible'
                    }}
                />
                <video
                    ref={videoRef}
                    className={center}
                    style={{
                        ...computeDimensions({
                            aspectRatio: videoAspectRatio,
                            maxWidth: width,
                            maxHeight: height
                        }),
                        visibility: stream.hasVideo ? 'visible': 'hidden'
                    }}
                />
                <VolumeIconContainer
                    isVolumeOn={stream.hasAudio}
                    containerWidth={width}
                    containerHeight={height}
                    style={{
                        visibility: stream.hasVideo && stream.hasAudio ? 'hidden': 'visible'
                    }}
                />
            </div>): null
        }
    </div>);

VideoPlayer.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    showLoading: PropTypes.bool,
    showError: PropTypes.bool,
    stream: PropTypes.shape({
        hasAudio: PropTypes.bool.isRequired,
        hasVideo: PropTypes.bool.isRequired,
    }),
    videoRef: PropTypes.func,
    videoAspectRatio: PropTypes.number,
    showOverlay: PropTypes.bool,
    onOverlayClick: PropTypes.func,
    onClick: PropTypes.func,
}

VideoPlayer.defaultProps = {
    showLoading: true,
    showError: false,
    stream: null,
    videoRef: null,
    videoAspectRatio: 4/3,
    showOverlay: false,
    onOverlayClick: () => {},
    onClick: () => {},
}

export default VideoPlayer;

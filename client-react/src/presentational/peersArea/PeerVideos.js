import React from "react";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import classNames from 'classnames';
import VideoContainer from '../../container/VideoContainer';
import './slick-theme-overrides.css';
import styles from './PeersArea.module.css';
import { center } from '../../utils/style-utils.module.css';

const slickSettings = {
    infinite: false,
    speed: 600,
    slidesToScroll: 1,
    dots: true,            
};

const VideoSlide = ({
    width,
    height,
    ...otherProps
}) => (
    <div style={{
        width,
        height
    }}>
        <VideoContainer 
            width={0.95*width}
            height={height}
            {...otherProps}
        />
    </div>);

// todo: enforce the constraint that the number of videos must be greater than 2
// todo: review this code later
const PeerVideos = ({
    width,
    height,
    peerVideos,
}) => {
    const slidesToShow = peerVideos.length >= 3 ? 3: 2;
    const isNavVisible = peerVideos.length > slidesToShow;
    const xSpaceLeft = isNavVisible ? 40: 20;
    const ySpaceLeft = slidesToShow >= 3? 40: 20;
    const innerWidth = width - xSpaceLeft;
    const innerHeight = height - ySpaceLeft;

    return (<div className={styles.container} style={{
        width,
        height,
    }}>
        <div 
            className={classNames(styles.videoContainer, {
                [center]: !isNavVisible
            })}
            style={{
                width: innerWidth,
                height: innerHeight,
                ...(peerVideos.length > 3 ? {
                    position: 'relative',
                    top: 15
                }: {})
            }}
        >
            <Slider {...slickSettings} slidesToShow={slidesToShow}>
                {peerVideos.map(({ id, videoData }) =>
                    <VideoSlide
                        key={id}
                        width={innerWidth/slidesToShow}
                        height={innerHeight}
                        {...videoData}
                    />
                )}
            </Slider>
        </div>
    </div>)
};

export default PeerVideos;

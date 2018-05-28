import React from 'react';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import styles from './SlickDemo.module.css';
import { center } from './utils/style-utils.module.css';
import './SlickDemo.css';
import classNames from 'classnames';

const settings = {
    infinite: false,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    dots: true,            
};

const Demo = () => (
    <div className={styles.container}>
        <div className={classNames(styles.c1, center)}>
            <div className={classNames(styles.c2, center)}>
                <Slider {...settings} className={styles.slider}>
                    <div className={styles.slide}>
                        <h3>1</h3>
                    </div>
                    <div className={styles.slide}>
                        <h3>2</h3>
                    </div>
                    <div className={styles.slide}>
                        <h3>3</h3>
                    </div>
                    <div className={styles.slide}>
                        <h3>4</h3>
                    </div>
                    <div className={styles.slide}>
                        <h3>5</h3>
                    </div>
                    <div className={styles.slide}>
                        <h3>6</h3>
                    </div>
                </Slider>
            </div>
        </div>
    </div>);

export default Demo;

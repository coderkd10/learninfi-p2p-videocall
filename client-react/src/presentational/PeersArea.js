import React from 'react';
import { Textfit } from 'react-textfit';
import classNames from 'classnames';
import styles from './PeersArea.module.css';
import { center } from '../utils/style-utils.module.css';

const PeersArea = ({
    width,
    height,
}) => (
    <div className={styles.container} style={{
        width,
        height,
    }}>
        {/* todo: show this only when we don't have any peers */}
        <div className={classNames(center, styles.waitingText)} style={{
            width: 0.75*width,
            height: 0.5*height,
            lineHeight: `${0.5*height}px`,
            textAlign: 'center',
        }}>
            <Textfit mode="single" forceSingleModeWidth={false}>
                Waiting for participants to join
            </Textfit>
        </div>
    </div>);

export default PeersArea;

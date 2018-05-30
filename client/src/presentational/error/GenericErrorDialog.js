import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ErrorIcon from 'react-icons/lib/md/error';
import RepeatIcon from 'react-icons/lib/fa/repeat';
import CloseIcon from 'react-icons/lib/md/close';
import styles from './ErrorDialog.module.css';

const GenericErrorDialog = ({
    open,
    onRetry,
    onClose,
    errDetails
}) => (
    <Dialog
        open={open}
        title={<h3><ErrorIcon/> Error occured while accessing camera</h3>}
        actions={[
            <FlatButton
                label="Retry"
                primary
                icon={<RepeatIcon/>}
                onClick={onRetry}
            />,
            <FlatButton
                label="Close"
                secondary
                icon={<CloseIcon/>}
                onClick={onClose}
            />,
        ]}
    >
        <div>
            Some unexpected error occured while trying to access your video & audio.<br/>
            This might be an issue with your hardware peripherals (webcam / microphone) or your browser software. We have reported this error to our development team and they'll be contacting you shortly.<br/>
            <br/>
            In the mean time we suggest you try the following -
            <ol>
                <li>Ensure that you have <b>some</b> hardware to support audio/ video call (if you are on a laptop 
                you most likely will have a webcam, on phone / tablet ensure that you have atleast one camera, 
                and if you are on a desktop computer ensure that you a webcam connected).</li>
                <li>Try restarting your browser / rebooting your computer and check if this issue persists (if your browser / computer hasn't been restarted for a long time, this might be a probable reason for the error)</li>
                <li>Test if your webcam is working correctly by using some native apps such as skype or FaceTime (on mac)</li>
                <li>Check if your browser supports audio / video call by using <a href="https://hangouts.google.com/">Google Hangouts</a> and ensure that you can make a <a href="http://plus.google.com/hangouts/_">test call</a></li>
            </ol>
            
            You can click on the <span className={styles.fakeButton}>Retry</span> button to check if the issue is resolved. Or you can also choose to use the application without access your audio / video by clicking on the <span className={styles.fakeButton}>Close</span> button (but this is not recommended).
            <hr/>
            <details>
                <summary>Technical Details</summary>
                {errDetails}
            </details>
        </div>
    </Dialog>
);

GenericErrorDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onRetry: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    errDetails: PropTypes.string.isRequired
}

export default GenericErrorDialog;

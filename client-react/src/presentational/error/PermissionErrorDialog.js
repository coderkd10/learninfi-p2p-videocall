import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ErrorIcon from 'react-icons/lib/md/error';
import PermCameraMic from 'react-icons/lib/md/perm-camera-mic';
import RepeatIcon from 'react-icons/lib/fa/repeat';
import CloseIcon from 'react-icons/lib/md/close';
import SendIcon from 'react-icons/lib/fa/paper-plane';
import permissionMailtoLink from './permission-mailto-link';
import styles from './ErrorDialog.module.css';

const PermissionErrorDialog = ({
    open,
    onRetry,
    onClose,
    unsurePermError,
}) => {
    let actions = [
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
    ];
    if (unsurePermError.isUnsure) {
        actions = [
            <FlatButton 
                label="Report"
                icon={<SendIcon/>}
                onClick={unsurePermError.handler}
            />,
            ...actions
        ];
    }

    return (<Dialog
        open={open}
        title={<h3><ErrorIcon/> Permission to access camera denied</h3>}
        actions={actions}
    >
        <div>
            <p>You have denied Learninfi to access you camera / microphone.</p>
            
            <p>We need your permission to access your camera or microphone <PermCameraMic/>, so that you can be connected to the confernce call with the teacher / student(s).
            If you have already dismissed the browser's permission dialog, due to the contraints improsed by the browser, we cannot re-request your permission. 
            So you may have to manually grant Learninfi permission to access you camera and microphone, instructions to which can be found <a href='https://web.archive.org/web/20180506103949/https://letsrabbit.zendesk.com/hc/en-us/articles/115003658728-How-do-I-enable-my-mic-camera-in-my-browser'> in this article</a> (just navigate to section corresponding to your browser and follow the instructions).
            </p>

            <p>Once you granted the permission to access audio & video, click on the <span className={styles.fakeButton}>Retry</span> button below. Or you can also choose to use the application without access your audio / video by clicking on the <span className={styles.fakeButton}>Close</span> button (but this is not recommended).</p>

            <p>(If you tried to, but are still unable / unsure how to grant the permission required to enable video call, please contact our customer support or write to us at <a href={permissionMailtoLink}>contact@learninfi.com</a>)</p>

            { unsurePermError.isUnsure ? <Fragment>
                <hr />
                <p>If you have already granted permission, or your browser insists that Learninfi does not ask for any, some unexpected error may have occured which is stoping us from getting access to your camera / microhone.
                If this is the case, please click on the <span className={styles.fakeButton}>Report</span> button to report this issue to our development team, so that they can investigate and fix this issue.
                </p>
                <details>
                    <summary>Technical Details</summary>
                    { unsurePermError.errDetails }
                </details>
            </Fragment>: null}
        </div>
    </Dialog>);
}

PermissionErrorDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onRetry: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    unsurePermError: PropTypes.shape({ // To show the report / details section
        isUnsure: PropTypes.bool.isRequired,
        errDetails: PropTypes.string,
        handler: PropTypes.func
    }),
};

PermissionErrorDialog.defaultProps = {
    unsurePermError: {
        isUnsure: false,
    },
};

export default PermissionErrorDialog;

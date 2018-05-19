import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import ErrorIcon from 'react-icons/lib/md/error';
import OkIcon from 'react-icons/lib/fa/check';

const AutoplayErrorDialog = ({
    open,
    onClose
}) => (
    <Dialog
        open={open}
        title={<h3><ErrorIcon /> Unable to autoplay video</h3>}
        contentStyle={{
            maxWidth: 550
        }}
        actions={[
            <FlatButton
                label="Ok"
                primary
                icon={<OkIcon/>}
                onClick={() => onClose(this.checkbox.checked)}
            />
        ]}
    >
    <div>Autoplay is disabled on your device. So we cannot automatically play your or your teacher / student's video.
    To play a given video please click on the play button the appears over the video.</div>
    <div style={{
        marginTop: 20
    }}>
        <input
            type="checkbox"
            style={{ marginRight: 8 }}
            ref={ref => {this.checkbox = ref}}
        />
        Don't show this dialog again
    </div>
    </Dialog>);

AutoplayErrorDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func
}

AutoplayErrorDialog.defaultProps = {
    onClose: () => {}
}

export default AutoplayErrorDialog;

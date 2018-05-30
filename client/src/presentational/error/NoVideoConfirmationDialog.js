import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const NoVideoConfirmationDialog = ({
    open,
    onConfirm,
    onClose,
}) => (
    <Dialog
        open={open}
        title={"Use without audio / video?"}
        contentStyle={{
            maxWidth: 450
        }}
        actions={[
            <FlatButton
                label="No"
                primary
                onClick={onClose}
            />,
            <FlatButton
                label="Yes"
                secondary
                onClick={onConfirm}
            />
        ]}
        onRequestClose={onClose}
    >
    Are you sure that you want to use the application without giving access to your audio or video? <br/>
    (You'll still be able to see and hear your teacher / student if they have allowed access to their audio / video).
    </Dialog>
);

NoVideoConfirmationDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default NoVideoConfirmationDialog;

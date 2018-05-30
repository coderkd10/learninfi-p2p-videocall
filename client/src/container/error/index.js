import React from 'react';
import PropTypes from 'prop-types';
import WithConfirmDialog from  './WithConfirmDialog';
import PermissionErrorDialog from '../../presentational/error/PermissionErrorDialog';
import GenericErrorDialog from '../../presentational/error/GenericErrorDialog';

// todo: log this error to backend
const errLogger = (err) =>
    console.log('some error occured - ', err);

const ErrorContainer = ({
    err,
    onRetry,
    onNoVideoConfirm,
}) => {
    let component;
    let props;

    if (
        err.name === 'PermissionDeniedError' || 
        err.message === 'Permission denied' ||
        err.name === 'NotAllowedError'
    ) {
        component = PermissionErrorDialog;
        let unsurePermError = null;
        if (err.name !== 'PermissionDeniedError' && 
            err.message !== 'Permission denied' ) {
            unsurePermError = {
                errDetails: err.toString(),
                // todo: show a dialog saying that error has
                // been logged to the backend
                handler: errLogger
            }
        }
        props = { unsurePermError };
    } else {
        // todo: there is also a case of
        // NotFoundError: Requested device not found
        // handle this error separately
        component = GenericErrorDialog;
        props = { errDetails: err.toString() }
    }

    return <WithConfirmDialog
        component={component}
        open={true}
        onRetry={onRetry}
        onNoVideoConfirm={onNoVideoConfirm}
        {...props}
    />
}

ErrorContainer.propTypes = {
    err: PropTypes.object.isRequired,
    onRetry: PropTypes.func.isRequired,
    onNoVideoConfirm: PropTypes.func.isRequired,
};

export default ErrorContainer;

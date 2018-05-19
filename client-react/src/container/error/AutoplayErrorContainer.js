import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import appState from '../../stores/AppState';
import AutoplayErrorDialog from '../../presentational/error/AutoplayErrorDialog';

@observer
class AutoplayErrorContainer extends Component {
    onClose = (dontShowDialog) => {
        if (dontShowDialog) {
            appState.showAutoplayErrorDialog = false;
        }
        this.props.onClose();
    }

    render() {
        return (
            <AutoplayErrorDialog
                open={this.props.requestOpen && appState.showAutoplayErrorDialog}
                onClose={this.onClose}
            />);
    }
}

AutoplayErrorContainer.propTypes = {
    requestOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};

AutoplayErrorContainer.defaultProps = {
    onClose: () => {},
};

export default AutoplayErrorContainer;

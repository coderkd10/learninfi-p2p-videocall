import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import NoVideoConfirmationDialog from '../../presentational/error/NoVideoConfirmationDialog';

// todo: can refactor this probably
class WithConfirmDialog extends Component {
    state = {
        confirmDialogOpen: false
    };

    handleCloseButtonClick = () => {
        this.setState({ confirmDialogOpen: true });
    }

    onCloseDialogRequest = () => {
        this.setState({ confirmDialogOpen: false });
    }

    onConfirm = () => {
        this.setState({ confirmDialogOpen: false });
        this.props.onNoVideoConfirm();
    }

    render() {
        const {
            component: ChildComponent,
            onNoVideoConfirm,
            ...otherProps
        } = this.props;
        return <Fragment>
            <ChildComponent 
                onClose={this.handleCloseButtonClick}
                {...otherProps}
            />
            <NoVideoConfirmationDialog 
                open={this.state.confirmDialogOpen}
                onConfirm={this.onConfirm}
                onClose={this.onCloseDialogRequest}
            />
        </Fragment>
    }
}

WithConfirmDialog.propType = {
    component: PropTypes.node.isRequired,
    onNoVideoConfirm: PropTypes.func.isRequired,
};

export default WithConfirmDialog;

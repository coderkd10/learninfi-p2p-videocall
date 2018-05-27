import React, { Component } from 'react';
import PropTypes from 'prop-types';
import 'offline-js';
import 'offline-js/themes/offline-language-english.css';
import 'offline-js/themes/offline-theme-slide.css';

class OfflineProvider extends Component {
    state = {
        isOnline: true,
    };

    onUp = () => {
        this.setState({
            isOnline: true,
        });
    }

    onDown = () => {
        this.setState({
            isOnline: false,
        });
    }

    componentDidMount() {
        window.Offline.on('up', this.onUp);
        window.Offline.on('down', this.onDown);
    }

    componentWillUnmount() {
        window.Offline.off('up', this.onUp);
        window.Offline.off('down', this.onDown);
    }

    render() {
        return this.props.children({ isOnline: this.state.isOnline });
    }
}

OfflineProvider.propTypes = {
    children: PropTypes.func.isRequired,
};

export default OfflineProvider;

import PropTypes from 'prop-types';

export const videoData = PropTypes.shape({
    showLoading: PropTypes.bool.isRequired,
    showError: PropTypes.bool.isRequired,
    stream: PropTypes.shape({
        hasAudio: PropTypes.bool.isRequired,
        hasVideo: PropTypes.bool.isRequired,
        streamObj: PropTypes.object,
    }),
});

export const defaultVideoData = {
    showLoading: true,
    showError: false,
    stream: null
};

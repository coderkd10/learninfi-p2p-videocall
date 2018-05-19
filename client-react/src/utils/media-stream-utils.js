const getAudioTrack = stream =>
    stream.getAudioTracks()[0];

const getVideoTrack = stream =>
    stream.getVideoTracks()[0];

export const hasAudio = stream => {
    const audioTrack = getAudioTrack(stream);
    return audioTrack && audioTrack.readyState === "live";
}

export const hasVideo = stream => {
    const videoTrack = getVideoTrack(stream);
    return videoTrack && videoTrack.readyState;
}

const removeAndStopTrack = (stream, track) => {
    stream.removeTrack(track);
    track.stop();
}

export const removeAndStopAudioTrack = stream => {
    const audioTrack = getAudioTrack(stream);
    audioTrack && removeAndStopTrack(stream, audioTrack);
}

export const removeAndStopVideoTrack = stream => {
    const videoTrack = getVideoTrack(stream);
    videoTrack && removeAndStopTrack(stream, videoTrack);
}

export const createEmptyStream = () => {
    if (window.MediaStream)
        return new window.MediaStream()
    return {};
}

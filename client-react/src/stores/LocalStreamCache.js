import {
    hasAudio,
    hasVideo,
    removeAndStopAudioTrack,
    removeAndStopVideoTrack,
    createEmptyStream,
} from '../utils/media-stream-utils';

export default class LocalStreamCache {
    _currentStreamPromise = null; // stream cache

    _init(audio, video) {
        if (!audio && !video) {
            return Promise.resolve(createEmptyStream());
        }
        this._currentStreamPromise = navigator.mediaDevices.getUserMedia({ audio, video });
        return this._currentStreamPromise;
    }

    async cleanup() {
        if (!this._currentStreamPromise)
            return;
        
        const tempPromise = this._currentStreamPromise;
        this._currentStreamPromise = null;
        const currentStream = await tempPromise;
        removeAndStopAudioTrack(currentStream);
        removeAndStopAudioTrack(currentStream);
    }

    async getStream(audio, video) {
        // Returns a cached promise to local (webcam) stream
        if (!this._currentStreamPromise) {
            return this._init(audio, video);
        }

        const currentStream = await this._currentStreamPromise;
        const hasPrevAudio = hasAudio(currentStream);
        const hasPrevVideo = hasVideo(currentStream);
        if (audio === hasPrevAudio && video === hasPrevVideo)
            return currentStream;
        else if ((hasPrevAudio || !audio) && (hasPrevVideo || !video)) {
            // current stream has required audio / video
            // just need to remove either (or both)
            if (hasPrevAudio && !audio) {
                removeAndStopAudioTrack(currentStream);
            }
            if (hasPrevVideo && !video) {
                removeAndStopVideoTrack(currentStream);
            }
            return currentStream;
        }
        this.cleanup();
        return this._init(audio, video);
    }
}

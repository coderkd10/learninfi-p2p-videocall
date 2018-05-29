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

        // note: this bit of code ensure that if we previously
        // had audio/ video track in the stream and it is no longer required we just stop
        // and cleanup the track in the stream. But this was causing problems while sending
        // the stream (on update) to peers. so removed this temporarily.
        // todo: need to find a good fix for this bug

        // else if ((hasPrevAudio || !audio) && (hasPrevVideo || !video)) {
        //     // current stream has required audio / video
        //     // just need to remove either (or both)
        //     if (hasPrevAudio && !audio) {
        //         removeAndStopAudioTrack(currentStream);
        //     }
        //     if (hasPrevVideo && !video) {
        //         removeAndStopVideoTrack(currentStream);
        //     }
        //     return currentStream;
        // }

        // don't know why calling clean does not release the web cam light
        // todo: need to figure out why this happens
        // this.cleanup();
        // for now manually calling remove and stop on the stream
        removeAndStopVideoTrack(currentStream);
        removeAndStopAudioTrack(currentStream);

        return this._init(audio, video);
    }
}

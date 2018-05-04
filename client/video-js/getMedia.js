/*************************************************************************
 * LEARNINFI CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2018 Pronovate Technologies Pvt. Ltd.
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Pronovate Technologies Pvt. Ltd. and its 
 * suppliers, if any. The intellectual and technical concepts 
 * contained herein are proprietary to Pronovate Technologies Pvt. 
 * Ltd. and its suppliers and are protected by all applicable 
 * intellectual property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Pronovate Technologies Pvt. Ltd.
 **************************************************************************/
 
// Need to compile this babel + 
// async-await runtime polyfill
// to run in older browsers

// Private variables for getMedia function
let currentStream; // has the reference current localStream
// resolves when the last call to function resolves
let prevPromise = Promise.resolve(); // used to synchronize function calls
// let lastCallId = 0; // only to log that calls are in order

const _getUserMedia = (constraints) => {
  const { audio, video } = constraints;
  if (!audio && !video) {
    // gum does not support both empty video and audio
    // so create an empty stream for in this case
    return new MediaStream();
  }

  return navigator.mediaDevices.getUserMedia(constraints)
  .catch(err => {
    if (err.name === 'PermissionDeniedError')
      alert('Please give permission for camera and mic and refresh the page');
    else
      alert('Some unexpected error occured - \n\n"' + err.stack + '"\n\nPlease copy this error message and contact support; also please email the error message to contact@learninfi.com, along with your name and learninfi username. Our support team may also request additional details, so please coperate so that we can resolve the error as fast as possible.\nUntill then you can use the alternate video call link provided.');
    throw err;
  });
}

const attachNewStream = async (audio, video) => {
  // get a new stream
  const newStream = await _getUserMedia({
    audio, video
  });
  // cleanup previous stream
  if (currentStream)
    currentStream.getTracks().forEach(track => track.stop());
  // assign new stream
  currentStream = newStream;
  return newStream;
}

const isAudioEnabled = stream => {
  if (!stream)
    return false;

  const audioTrack = stream.getAudioTracks()[0];
  return audioTrack && audioTrack.readyState === "live";
}

const isVideoEnabled = stream => {
  if (!stream)
    return false;

  const videoTrack = stream.getVideoTracks()[0];
  return videoTrack && videoTrack.readyState === "live";
}

const getMedia = (audio=true, video=true) => {
  // const id = lastCallId + 1;
  // lastCallId = id;
  // console.log('getMedia called : id - ', id);
  
  prevPromise = prevPromise.then(async () => {
    let ans;
    if (!currentStream) {
      ans = await attachNewStream(audio, video);
    } 
    else {
      let audioEnabled = isAudioEnabled(currentStream);
      let videoEnabled = isVideoEnabled(currentStream);

      if (audioEnabled === audio && videoEnabled == video) {
        ans = currentStream;
      }
      else if (
        (audioEnabled || !audio) && 
        (videoEnabled || !video)
      ) {
        if (audioEnabled && !audio) {
          const audioTrack = currentStream.getAudioTracks()[0];
          currentStream.removeTrack(audioTrack);
          audioTrack.stop();
        }
        if (videoEnabled && !video) {
          const videoTrack = currentStream.getVideoTracks()[0];
          currentStream.removeTrack(videoTrack);
          videoTrack.stop();
        }
        ans = currentStream;
      }
      else {
        ans = await attachNewStream(audio, video);
      }
    }

    // console.log('getMedia finished : id - ', id);
    return ans;
  });
  return prevPromise;
}
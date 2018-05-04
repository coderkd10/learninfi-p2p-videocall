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

const HOST = "localhost";
const PORT = 3500;

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// get id from div
// if not assigned, assign one and return
const getId = div => {
    let id = div.attr("id");
    if (!id) {
        id = uuid();
        div.attr("id", id);
    }
    return id;
}

const getStreamFromVideo = video => {
    if ('srcObject' in video)
        return video.srcObject;
    else
        return video.captureStream();
}
// video.play may not return a promise
// ensure that we return a promise
const _play = video => {
    const stream = getStreamFromVideo(video);
    if (!isAudioEnabled(stream) && !isVideoEnabled(stream)) {
        // in the absense of audio / video in the stream
        // don't try and play video
        return Promise.resolve();
    }

    let promise = video.play();
    if (promise === undefined)
        promise = Promise.resolve();
    return promise;
}

// Id of the main video element
const MAIN_VIDEO_ID = "main-video-container";
// keeps track of which peer is in the main video
// SELF peer referes to the "this" / current peer
let MAIN_VIDEO_PEER = "SELF";

// keeps track of failed autoplays
const failedPlays = new Set();
let shownAutoplayMessage = false;
// Handle overlay click
const tryPlayAgain = id => {
    const div = $("#"+id);
    const video = div.find("video")[0];
    const overlay = div.find(".overlay");
    overlay.css("visibility", "hidden");
    // remove this from failed plays since we have handled it
    failedPlays.delete(id);
    _play(video)
    .catch((e) => handleFailedPlay(e, div));
}  
const handleFailedPlay = (error, div) => {
    // don't log abort errors
    if (error.name === "AbortError") {
        return;
    }

    console.log("plaback of div - ", div, " failed due to : ", { error });
    // if autoplay has been blocked then error must be a NotAllowedError
    // if we have some other error ignoring that for now
    if (error.name !== "NotAllowedError") {
        return;
    }

    if (!shownAutoplayMessage) {
        alert("Autoplay is disabled on your device. Please click on the play icon in the video(s) to start playing.");
        shownAutoplayMessage = true;
    }
    const id = getId(div);
    failedPlays.add(id);
    const overlay = div.find(".overlay");
    overlay.css("visibility", "visible");
    // Remove previous listeners
    overlay.off("click");
    // Add new listener
    overlay.on("click", () => {
        // First try playing back this video
        tryPlayAgain(id);
        // Next try the main video
        if (id !== MAIN_VIDEO_ID) {
            tryPlayAgain(MAIN_VIDEO_ID);
        }
        for (let otherId of failedPlays) {
            if (otherId !== id && otherId !== MAIN_VIDEO_ID) {
                tryPlayAgain(otherId);
            }
        }
    });
}

const playVideo = (div, stream, {
    // if stream has audio, controls if we show muted icon or not
    // if not specified, icon state is infered from the muted param
    showMuted,
    // actually controls if the video is muted
    // can have case when - we display volume icon to be ON,
    // but actually mute the video    
    muted,
    // option that decides to actually trigger run
    // if play video.play is not called
    // necessary since playing video and initializing slick
    // may cause error
    play = true
} = {}) => {
    const userIcon = div.find("i.user-icon");
    const volumeIcon = div.find("i.volume-icon");
    const video = div.find("video")[0];
    const overlay = div.find(".overlay");
    // Hide the overlay
    overlay.css("visibility", "hidden");
    video.pause();
    // display video / user-icon
    if (isVideoEnabled(stream)) {
        // we have video
        userIcon.css("visibility", "hidden");
        $(video).css("visibility", "visible");
    } else {
        // no video
        userIcon.css("visibility", "visible");
        $(video).css("visibility", "hidden");
    }
    let volumeIconState; // "ON" / "MUTE" / "OFF";
    const hasAudio = isAudioEnabled(stream);
    if (!hasAudio) {
        volumeIconState = "OFF";
        muted = true;
    } else {
        if (showMuted === undefined) {
            showMuted = muted === undefined ? false : muted;
        }
        volumeIconState = showMuted ? "MUTE" : "ON";
        if (muted === undefined) {
            muted = showMuted;
        }
    }

    // display correct form of volume icon
    volumeIcon.css("visibility", "visible");
    volumeIcon.text(volStateToText(volumeIconState));

    video.muted = muted; 

    if ('srcObject' in video)
        video.srcObject = stream;
    else {
        video.src = window.URL.createObjectURL(stream);        
    }



    let promise;
    if (stream && play) {
        promise = _play(video)
        .catch((e) => { handleFailedPlay(e, div) });
    } else {
        promise = Promise.resolve();
    }

    return {
        promise,
        volumeIconState,
        muted
    };
}
// trigger play again on the div that may have been paused
// in the dom due to some reason
const rePlay = div => {
    const video = div.find("video")[0];
    const promise = _play(video)
    .catch((e) => handleFailedPlay(e, div));
    return promise;
}

const playMainVideo = (stream, opts = {}) => {
    const res = playVideo($("#"+MAIN_VIDEO_ID), stream, opts);
    const {
        volumeIconState
    } = res;
    setVolBtn(volumeIconState);
    return res;
}

const volStateToText = state => {
    switch(state) {
        case "ON" : return "volume_up";
        case "MUTE" : return "volume_mute";
        case "OFF" : return "volume_off";
    }
}
let currentVolState; // Remember to initialize it
const volBtnHandler = () => {
    if (currentVolState === "OFF") {
        console.warn("--> volume handler should not be called when there is no audio");
        return;
    }

    const prevMuted = currentVolState === "MUTE";
    const muted = !prevMuted;
    // set the current muted state
    isMuted[MAIN_VIDEO_PEER] = muted;

    if (connectedPeers === 0) {
        // only single main video
        playMainVideo(localStream, { muted });
    } else {
        // we have slick initiated
        const container = getPeerDiv(MAIN_VIDEO_PEER);
        const video = container.find("video")[0];
        const stream = peerStreams[MAIN_VIDEO_PEER];
        playVideo(container, stream, { muted });
        playMainVideo(stream, {
            showMuted : muted,
            muted : true
        });
    }
}
const setVolBtn = (state) => {
    // set the state variable
    currentVolState = state;

    const btn = $("#btnMute");
    // disable previous click handler
    btn.off("click");
    const icon = btn.find("i");
    icon.text(volStateToText(state));
    if (state === "OFF") {
        // set pointer to not allowed
        btn.css("cursor", "not-allowed");
        // TODO : disable hover effet; to much effort for now
    } else {
        btn.on("click", volBtnHandler);
        btn.css("cursor", "pointer");
    }
}

let peerIds = new Set();
let localStream;
// mapping btwn stream and isMuted property
// k - peer id, v - isMuted (boolean)
const isMuted = {};
const getIsMuted = peerId => {
    const fromMap = isMuted[peerId];
    return fromMap === undefined ? false : fromMap;
}

const slickContainer = $(".peer-videos-container");
const initSlick = (slidesToShow, opts = {}) => {
    const defaultOpts = {
        slidesToShow,
        infinite: false,
        dots: true,
        slidesToScroll: 1,
        speed : 600
    }
    slickContainer.slick({
        ...defaultOpts,
        ...opts
    });
}
// number of connected peers whose stream we are displaying
const smallVideoTmpl = `<div class="small-video">
  <div class="overlay">
    <i class="fa fa-play play-btn"></i>
  </div>
  <i class="fa fa-user user-icon"></i>
  <i class="material-icons volume-icon">volume_up</i>
  <video></video>
</div>`;
let connectedPeers = 0;
// Mapping between peerId and id of its div in the slick container
const peerDivs = {};
// mapping between peerId and its stream
const peerStreams = {};
// set peer data (div, stream)
const setPeer = (peerId, div, stream) => {
    // set div
    const divId = getId(div);
    peerDivs[peerId] = divId;
    // set stream
    peerStreams[peerId] = stream;
}
const removePeer = peerId => {
    delete peerDivs[peerId];
    delete peerStreams[peerId];
}

const getPeerDiv = peerId => {
    const divId = peerDivs[peerId];
    return $("#"+divId);
}

const attachPeerClickListener = peerId => {
    const video = getPeerDiv(peerId);
    const stream = peerStreams[peerId];
    // remove previous click listeners if any
    video.off("click");
    video.on("click", () => {
        // set main video id
        MAIN_VIDEO_PEER = peerId;
        playMainVideo(stream, {
            showMuted : getIsMuted(peerId),
            muted : true
        });
    });
}

const playAllSlick = () => {
    for (const peerId in peerDivs) {
        // also reattach the click listener
        attachPeerClickListener(peerId);

        const video = getPeerDiv(peerId);
        rePlay(video);
    }
}
const addPeerStream = (peerId, stream) => {
    // when the stream is first added, we don't purposefully mute it
    isMuted[peerId] = false;
    const newVid = $(smallVideoTmpl);
    // record this div as belonging to this peer
    setPeer(peerId, newVid, stream);
    // don't attach click listener here
    // can be remove when initing slick; but will be attached in playAll

    switch(connectedPeers) {
        case 0:
            $(".peers-container h2").css("visibility", "hidden");

            // Add videos
            // first add the localStream
            const locVid = $(smallVideoTmpl);
            // record the self div
            setPeer("SELF", locVid, localStream);

            slickContainer.append(locVid);
            playVideo(locVid, localStream, {
                muted : getIsMuted("SELF"),
                play : false
            });
            // Add the new video
            slickContainer.append(newVid);
            playVideo(newVid, stream, { play : false });

            // also make this new video play in the main video
            MAIN_VIDEO_PEER = peerId;
            playMainVideo(stream, {
                showMuted : getIsMuted(peerId),
                muted : true
            });

            // init slick here
            initSlick(2);
            break;

        default:
            // slickAdd does not work
            // so unslicking and then reslicking
            const initialSlide = slickContainer.slick('slickCurrentSlide');
            slickContainer.slick("unslick");
            slickContainer.append(newVid);
            playVideo(newVid, stream, { play : false });
            // make 3 side by side videos
            initSlick(3, {
                initialSlide
            });
            break;
    }
    connectedPeers++;
    playAllSlick();
}


// helper function to figure out correct initialSlide number
const adjustInitialSlide = (before, curNumPeers) => {
    if (before === 0)
        return before;
    // Assuming we have 3 peers per slide
    // which is true if we are not on the 1st slide anyway
    const minPeerRequired = before*3 + 1;
    if (curNumPeers >= minPeerRequired)
        return before;
    else
        return before-1;
}

// tries to remove video as cleanly as possible
const removeVideo = container => {
    // remove click listener
    container.off('click');
    // wait if previous call to play has not yet resolved
    const video = container.find("video")[0];
    video.pause();
    $(video).remove();
    container.remove();
}

// should only be called with other peers
// and not "SELF"
const removePeerStream = peerId => {
    // keep track of current slide
    let initialSlide = slickContainer.slick('slickCurrentSlide');
    slickContainer.slick("unslick");
    const video = getPeerDiv(peerId);
    removeVideo(video);
    connectedPeers--;
    // remove div and stream
    removePeer(peerId);

    // check if this peer is in the main video
    // if so replace it with the self stream
    if (MAIN_VIDEO_PEER === peerId) {
        MAIN_VIDEO_PEER = "SELF";
        const opts = {
            showMuted : getIsMuted("SELF")
        };
        if (connectedPeers !== 0) {
            // if there is more than one peer
            // then self is also present in slick and hence
            // mute the main video
            opts.muted = true;
        }
        playMainVideo(localStream, opts);
    }

    if (connectedPeers === 0) {
        // no more peers lef, show waiting
        $(".peers-container h2").css("visibility", "visible");
        // also remove the self stream in slick
        const selfSlick = getPeerDiv("SELF");
        removeVideo(selfSlick);
        removePeer("SELF");
    } else {
        // init slick again
        // adjust initialSlide number if required
        initialSlide = adjustInitialSlide(initialSlide, connectedPeers);
        const perSlide = connectedPeers == 1 ? 2 : 3;
        initSlick(perSlide, { initialSlide });
        // replay all the videos again
        playAllSlick();
    }
}

// okay to be called with SELF
const updatePeerStream = (peerId, stream) => {
    const video = getPeerDiv(peerId);
    
    // add this new stream to peerStreams
    peerStreams[peerId] = stream;
    // attach new click listener
    attachPeerClickListener(peerId);

    // update with new stream
    playVideo(video, stream, {
        muted : getIsMuted(peerId)
    });

    // check if this peer is in the main video
    if (MAIN_VIDEO_PEER === peerId) {
        // this is also in the main video
        // hence update main video also
        playMainVideo(stream, {
            showMuted : getIsMuted(peerId),
            muted : true
        });
    }
};

const addOrUpdatePeerStream = (peerId, stream) => {
    if (peerId in peerDivs) {
        // already exists => update
        updatePeerStream(peerId, stream);
    } else {
        // add new stream
        addPeerStream(peerId, stream);
    }
}

const fullScreenVideo = () => {
    let container;
    if (connectedPeers === 0) {
        container = $("#" + MAIN_VIDEO_ID);
    } else {
        container = getPeerDiv(MAIN_VIDEO_PEER);
    }
    const video = container.find("video")[0];
    screenfull.request(video);
}

let peer;
const initiatePeerCon = peers => {
    // set of peers
    // to initiate calls to them
    for (const peerId of peers) {
        const call = peer.call(peerId, localStream);
        call.on('stream', stream => {
            addOrUpdatePeerStream(peerId, stream);
        });
    }
}

const updateLocalStream = async (audio, video) => {
    // get new stream
    localStream = await getMedia(audio, video);
    if (connectedPeers === 0) {
        playMainVideo(localStream, { muted : isMuted["SELF"] });
    } else {
        updatePeerStream("SELF", localStream);
    }

    // now update the peers
    initiatePeerCon(peerIds);
}

const getAudioVideoState = () => {
    const videoAllowed = localStorage.getItem("videoAllowed");
    const audioAllowed = localStorage.getItem("audioAllowed");
    const video = videoAllowed? videoAllowed !== "false" : true;
    const audio = audioAllowed? audioAllowed !== "false" : true;
    return { audio, video };
}

const setAudioVideoState = ({ audio, video }) => {
    if ( audio !== undefined ) {
        localStorage.setItem("audioAllowed", audio? "true" : "false");
    }
    if ( video !== undefined ) {
        localStorage.setItem("videoAllowed", video? "true" : "false");
    }
}

const setVideoIcon = (allowed) => {
    const icon = $("#btnShareVideo i");
    if (allowed) {
        icon.text("videocam");
    } else {
        icon.text("videocam_off");
    }
}

const setAudioIcon = (allowed) => {
    const icon = $("#btnShareAudio i");
    if (allowed) {
        icon.text("mic");
    } else {
        icon.text("mic_off");
    }
}

const toggleVideo = () => {
    let { audio, video } = getAudioVideoState();
    video = !video;
    setAudioVideoState({ video });
    setVideoIcon(video);
    updateLocalStream(audio, video);
}

const toggleAudio = () => {
    let { audio, video } = getAudioVideoState();
    audio = !audio;
    setAudioVideoState({ audio });
    setAudioIcon(audio);
    updateLocalStream(audio, video);
}

const initVideo = async (roomId) => {
    const { audio, video } = getAudioVideoState();
    setAudioIcon(audio);
    setVideoIcon(video);

    localStream = await getMedia(audio, video);
    // start self video in muted mode by default  
    playMainVideo(localStream, { muted : true });
    isMuted["SELF"] = true;

    // Attach handler to fullscreen btn
    $("#btnEnlargeVideo").on('click', fullScreenVideo);
    // Attach audio video button handlers
    $("#btnShareVideo").click(toggleVideo);
    $("#btnShareAudio").click(toggleAudio);

    // TODO : specify a stun and turn server
    peer = new Peer({
      host : HOST,
      port : PORT,
      path : "/peerjs",
      debug : 2,
      config: {'iceServers': [
        { urls: 'stun:stun.l.google.com:19302' },
        // setup a turn server and specify its url and credentials as follows
        // { urls: 'turn:<turn-server-hostname>:3478', username : "<enter-username>", credential : "<enter-password>" }
        // to set up turn server please refer - https://stackoverflow.com/questions/22233980/implementing-our-own-stun-turn-server-for-webrtc-application
      ]}
    });

    const peerId = await (new Promise((resolve, reject) => {
      peer.on('open', id => {
        console.log('connected to peer server. id - ', id);
        resolve(id);
      });
    }));

    // answer remote peer calls
    peer.on('call', call => {
        const remoteId = call.peer;

        // if not already connected make a call
        // to send our localStream
        if (!peerIds.has(remoteId)) {
            peer.call(remoteId, localStream);
        }

        call.answer();
        // just on receiving the call set peerStream to null
        // to handle the case of both empty audio and video
        // since in that case "stream" event below is not triggered
        addOrUpdatePeerStream(remoteId, null);
        call.on('stream', stream => {
            // add to set; if already exists no effect
            peerIds.add(remoteId);
            addOrUpdatePeerStream(remoteId, stream);
        });
    });

    const VIDEO_SOCKET_URL = `${HOST}:${PORT}`;
    const vidSocket = io(VIDEO_SOCKET_URL);
    vidSocket.on('connect', () => {
        vidSocket.emit('room', {
            peerId,
            room : roomId
        });
    });
    vidSocket.on('otherPeerIds', _peerIds => {
        console.log("--> other peers : ", _peerIds);
        const newPeerIds = new Set(_peerIds);
        // initiate connections to new peers
        initiatePeerCon(newPeerIds);
        // add old ids here
        for (const id of peerIds) {
            newPeerIds.add(id);
        };
        peerIds = newPeerIds;
    });
    vidSocket.on('peerDisconnected', peerId => {
        console.log("--> peer disconnected : " + peerId);
        if (peerIds.has(peerId)) {
            peerIds.delete(peerId);
            removePeerStream(peerId);
        }
    });
}

window.initVideo = initVideo;

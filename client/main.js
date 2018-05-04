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

// generates random string of any size
function randStr(size) {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < size; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
}

// get query parameter from url
function getQueryParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var roomId = getQueryParam("room");
if (!roomId) {
    // generate random param and reload
    roomId = randStr(4);
    window.location.search = (window.location.search ? window.location.search + "&" : "") + "room=" + roomId;
}
// init video call
window.initVideo(roomId);

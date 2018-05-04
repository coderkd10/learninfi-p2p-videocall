#!/usr/bin/env node

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

const express = require('express');
const app = express();
const ExpressPeerServer = require('peer').ExpressPeerServer;
const detect = require('detect-port');
const argv = require('yargs')
  .usage('Usage: $0\n\nStarts the learninfi video server')
  .options({
    port: {
      alias: 'p',
      description: 'port',
      default: 3500
    },
    sslkey: {
      alias: 'k',
      description: 'path to SSL key (e.g. privkey.pem)'
    },
    sslcert: {
      alias: 'c',
      description: 'path to SSL certificate (e.g. fullchain.pem)'
    },
    sslca: {

    }
  })
  .help('h')
  .alias('h', 'help')
  .epilog('If both sslkey & sslcert are specified then server will be run using https\n\ncopyright 2018 Pronovate Technologies Pvt. Ltd.')
  .argv;

const { port, sslkey: keyPath, sslcert: certPath } = argv;

(async () => {

  // check if port is free
  const _port = await detect(port);
  if (_port !== port) {
    console.warn(`Cannot use port ${port}.\nEither it is already in use by some other process, or we don't have the permission to use it.\n\nTry using some other port (e.g ${_port})`);
    process.exit(1);
  }

  let peerjsOpts = {};
  let transport; // http / https

  if (keyPath || certPath) {
    if (keyPath && certPath) {
      const fs = require('fs');
      // safe method to read file and
      // handle errors properly
      const fileRead = path => {
        try {
          return fs.readFileSync(path);
        }
        catch(err) {
          switch(err.code) {
            case "ENOENT":
              console.warn(`No such file exists '${path}'`);
              break;
            case "EACCES":
              console.warn(`Permission denied. Cannot read file '${path}'\n\nTry running using sudo`);
              break;
            case "EISDIR":
              console.warn(`'${path}' is a directory and not a file. Please provide a valid file path.`);
              break;
            default:
              console.warn(err.message);
          }
          process.exit(1);
        }
      }
      const key = fileRead(keyPath);
      const cert = fileRead(certPath);
      const ssl = { key, cert };
      // use a https server
      transport = require('https').Server(ssl, app);
      peerjsOpts = { ssl };
    } else {
      console.warn("you need to specify both sslkey and sslcert for using HTTPS");
      process.exit(1);
    }
  } else {
    // use a http server
    transport = require('http').Server(app);
  }

  app.use(express.static(__dirname + '/public'));
  app.use('/peerjs', ExpressPeerServer(transport, peerjsOpts));

  const io = require('socket.io')(transport);
  io.on('connection', onConnection);

  transport.listen(port, () => console.log('server started on port ' + port));
})()


// map - k : room, v : Array of peer Ids
const peerIds = {};

function onConnection(socket) {
  socket.on('room', function({ room, peerId }) {
    if (socket.room){
      socket.leave(socket.room);
		}
    // init peerIds if empty
    if (!peerIds[room])
      peerIds[room] = new Set();

    socket.emit('otherPeerIds', Array.from(peerIds[room]));
    peerIds[room].add(peerId);
    socket.peerId = peerId;

    socket.room = room;
    socket.join(room);
  });

  socket.on('disconnect', () => {
    if (!peerIds[socket.room]) {
      return;
    }

    peerIds[socket.room].delete(socket.peerId);
    if (peerIds[socket.room].size == 0) {
      // all disconnected
      delete peerIds[socket.room];
    } else {
      // some still connected
      socket.broadcast.to(socket.room).emit('peerDisconnected', socket.peerId);
    }
  });
}

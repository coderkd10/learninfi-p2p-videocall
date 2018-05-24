// todo: Implement mechanism to restart the server once it goes down
// todo: log whenever a user connects / disconnects along with the reason for same

const {
    ROOM_JOIN_REQUEST,
    PEER_LEFT_ROOM,
    PEER_JOINED_ROOM,
} = require('../common/socket-io-events');
const utils = require('../common/utils');
const io = require('socket.io')();

const rooms = {};
const joinRoom = (socket, roomName) => {
    if (!rooms[roomName]) {
        rooms[roomName] = [];
    } else {
        // notify other peers that this guy joined
        io.to(roomName).emit(PEER_JOINED_ROOM, socket.id);
    }
    rooms[roomName].push(socket.id);
    return rooms[roomName];
}

const leaveRoom = (socket, roomName) => {
    socket.leave(socket.roomName);
    if (!rooms[roomName]) {
        // can this actually happen ?
        // todo: enable some logging here to catch
        // whenever this happens in the wild
        return;
    }
    rooms[roomName] = utils.removeInArray(rooms[roomName], socket.id);
    if(rooms[roomName].length === 0) {
        delete rooms[roomName];
    }
    else {
        io.to(roomName).emit(PEER_LEFT_ROOM, socket.id);
    }
}

io.on('connection', socket => {
    console.log("connected to client - " + socket.id);

    socket.on(ROOM_JOIN_REQUEST, (roomName, cb) => {
        if (socket.roomName) {
            // disconnet from previously connected rooms if any
            leaveRoom(socket, socket.roomName);
        }
        socket.roomName = roomName;
        socket.join(roomName, err => {
            if (err) {
                // todo: handle /log err
                console.error(err);
                return cb(err);
            }
            cb(null, joinRoom(socket, roomName));
        });
    });

    socket.on('disconnect', (reason) => {
        console.log(`client ${socket.id} disconnected`);

        if (socket.roomName) {
            leaveRoom(socket, socket.roomName);
        }
    });
});



io.listen(3500);
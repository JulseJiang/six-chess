/**
 * socket.io服务端js
 * Created by CHEN on 2016/10/23.
 */

var io = require('socket.io')(3001);

var count = 0;

io.on('connection', function (socket) {
    socket.on('conn', function (room) {
        socket.join(room);
        console.log(room);
    });

    socket.on('start', function (room) {
        socket.to(room).emit('started');
    });

    socket.on('game', function (room, data) {
        socket.to(room).emit('game',data);
        console.log(data);
    });

    console.log(++count);
});
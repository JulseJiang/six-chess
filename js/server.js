/**
 * socket.io服务端js
 * Created by CHEN on 2016/10/23.
 */

var io = require('socket.io')(3001);

/**
 * 房间管理
 */
var Room = {};

/**
 * 开始
 */
var Start = {};

/**
 * 返回房间号
 * @param {string} socketId 客户端socketID
 * @return {string}
 */
function getRoom(socketId) {
    var room;
    for (var d in Room) {
        if (Room[d] instanceof Array) {
            if (Room[d].indexOf(socketId) >= 0) {
                room = d;
                break;
            }
        }
    }
    return room;
}

/**
 * 添加一个客户端到房间Room
 * @param {string} room 房间号
 * @param {string} socketId 客户端socketID
 * @return {boolean} 返回是否添加成功
 */
function insertToRoom(room, socketId) {
    if (Room[room] === undefined) {
        Room[room] = [];
    }
    if (Room[room].length >= 2) {
        return false;
    }
    if (Room[room].indexOf(socketId) === -1) {
        Room[room].push(socketId);
    }
    return true;
}

/**
 * 从房间中删除一个客户端
 * @param {string} room 房间号
 * @param {string} socketId 客户端socketID
 */
function deleteFromRoom(room, socketId) {
    var index = -1;
    if (Room[room] && Room[room] instanceof Array) {
        index = Room[room].indexOf(socketId);
    }
    if (index >= 0) {
        Room[room].splice(index, 1);
    }
}

/**
 * 监听客户端连接事件
 */
io.on('connection', function (socket) {

    //加入房间
    socket.on('join', function (room) {
        if (room && room.length == 10) {
            if (insertToRoom(room, socket.id)) {
                socket.join(room);
                socket.emit('info', '加入房间成功.');
            } else {
                socket.emit('info', '加入房间失败，房间人数已满.', false);
            }
            if (Room[room].length == 2) {
                socket.emit('ready');
                socket.to(room).emit('ready');
            }
        } else {
            socket.emit('info', '加入房间发生了错误，房间号格式错误', false);
        }
    });

    //客户端断开连接
    socket.on('disconnect', function () {
        var room = getRoom(socket.id);
        socket.to(room).emit('leave');
        socket.leave(room);
        deleteFromRoom(room, socket.id);
    });

    //
    socket.on('start', function (room) {
        socket.to(room).emit('started', socket);
    });

    socket.on('game', function (room, data) {
        socket.to(room).emit('game', data);
    });

    setTimeout(function () {
        //socket.broadcast.emit('game', socket.rooms);
    }, 5000);


});



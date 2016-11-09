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
 * 游戏过程记录
 */
var Game = {};

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
    //判断当前房间是否为空
    if (Room[room] && Room[room].length == 0) {
        delete Room[room];
    }
}

/**
 * 插入游戏过程的数据
 * @param {string} room 房间号
 * @param {object} data 游戏数据 对象，包括loop和data
 */
function insertToGame(room, data) {
    if (Game[room] === undefined || !(Game[room] instanceof Array)) {
        Game[room] = [];
    }
    Game[room].push(data);
}

/**
 * 初始化游戏房间数据
 * @param {string} room 房间号
 * @param {int} loop
 */
function initGame(room, loop) {
    Game[room] = [];

    var choose = 1;
    var opt = 3 - choose;
    var row1 = [opt, opt, choose, choose];
    var row2 = [opt, 0, 0, choose];
    var row3 = [opt, 0, 0, choose];
    var row4 = [opt, opt, choose, choose];
    var arr = [];
    arr.push(row1, row2, row3, row4);
    var data = {
        loop: loop,
        data: arr
    };
    Game[room].push(data);
}

/**
 * 删除某个房间的游戏数据
 * @param {string} room 房间号
 */
function deleteFromGame(room) {
    if (Game[room]) {
        delete Game[room];
    }
}

/**
 * 获取悔棋之后的游戏数据
 * @param {string} room 房间号
 * @param {string} step 悔棋步数
 * @return {object} 返回游戏数据
 */
function getUndoGame(room, step) {
    var data = {loop: 1, data: []};
    if (Game[room] && Game[room] instanceof Array) {
        if (Game[room].length > step) {
            Game[room].splice(Game[room].length - step, step);
            data = Game[room][Game[room].length - 1];
        } else {
            data = Game[room][0];
        }
    }
    console.log(Game[room]);
    return data;
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
                if (Room[room].length == 2) {
                    socket.emit('ready');
                    socket.to(room).emit('ready');
                }
            } else {
                socket.emit('info', '加入房间失败，房间人数已满.', false);
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
        deleteFromGame(room);
    });

    //客户端点击开始游戏
    socket.on('start', function (room) {
        socket.to(room).emit('started');
    });

    //双方点击开始，开始游戏
    socket.on('reallyStart', function (room) {
        var loop = Math.round(Math.random() + 1);
        var colors = [1, 2];
        var choose = Math.round(Math.random());
        initGame(room, loop);
        socket.emit('reallyStart', {
            myChoose: colors[choose],
            loop: loop
        });
        socket.to(room).emit('reallyStart', {
            myChoose: colors[1 - choose],
            loop: loop
        });
    });

    //显示所有房间
    socket.on('showRooms', function () {
        socket.emit('showRooms', Room);
    });

    //玩家走棋
    socket.on('game', function (room, data) {
        socket.to(room).emit('game', data);
        insertToGame(room, data);
        console.log(Game[room]);
    });

    //认输
    socket.on('defeat', function (room) {
        socket.emit('defeat', '游戏结束：你 输了');
        socket.to(room).emit('defeat', '游戏结束：对手认输，你 赢了');
    });

    //对手请求和棋
    socket.on('peace', function (room) {
        socket.to(room).emit('peace');
    });

    //对手同意和棋
    socket.on('surePeace', function (room, isSure) {
        if (isSure) {
            socket.emit('surePeace', '游戏结束：和棋', isSure);
            socket.to(room).emit('surePeace', '游戏结束：和棋', isSure);
        } else {
            socket.to(room).emit('surePeace', '对手 不同意和棋', isSure);
        }
    });

    //悔棋
    socket.on('undo', function (room) {
        if (Game[room] && Game[room].length)
            socket.to(room).emit('undo');
    });

    //对手同意悔棋
    socket.on('sureUndo', function (room, isSure, step) {
        if (isSure) {
            var data = getUndoGame(room, step);
            socket.emit('sureUndo', data, isSure);
            socket.to(room).emit('sureUndo', data, isSure);
        } else {
            socket.to(room).emit('sureUndo', '对手 不同意悔棋', isSure);
        }
    })

});



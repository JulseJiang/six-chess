/**
 * 在线版客户端
 * Created by CHEN on 2016/10/23.
 */

var Client = {
    socket: null
};

/**
 * 获取房间号
 * @return {string}
 */
Client.getRoom = function () {
    var hash = location.hash.trim();
    return hash.substring(1);
};

/**
 * 添加一条日志
 * @param {string} text 日志内容
 * @param {boolean,string} isInfo isInfo为false表示错误信息，为'game'表示游戏信息，其他为普通信息
 */
Client.addLogs = function (text, isInfo) {
    var logs = document.getElementById('logs');
    var p = document.createElement('p');
    if (isInfo === false) {
        p.className = 'error';
    } else if (isInfo === 'game') {
        p.className = 'game';
    }
    p.innerHTML = text;
    logs.appendChild(p);

    //日志条数超过30条，就清除最开始的一条日志
    var p_list = logs.querySelectorAll('p');
    if (p_list.length > 30) {
        logs.removeChild(p_list[0]);
    }
    logs.querySelector('p:last-of-type').scrollIntoView();
};

/**
 * 清空日志
 */
Client.clearLogs = function () {
    var logs = document.getElementById('logs');
    logs.innerHTML = '';
};

/**
 * 客户端初始化
 */
Client.init = function () {

    //房间号格式验证
    if (this.getRoom().length !== 10) {
        location.replace('./index.html');
        return;
    }

    //连接服务器
    this.socket = io.connect('http://localhost:3001');

    //连接成功
    this.socket.on('connect', function () {
        Client.addLogs('服务器连接成功.');
    });

    //连接失败
    this.socket.on('error', function () {
        Client.addLogs('连接失败.', false);
    });

    //断开连接
    this.socket.on('disconnect', function () {
        Client.addLogs('断开连接，正在重连...', false);
    });

    //监听服务器信息
    this.socket.on('info', function (info, error) {
        Client.addLogs(info, error);
    });

    //玩家就绪，准备开始
    this.socket.on('ready', function () {
        Game.isReady = true;
        Client.addLogs('玩家已就绪，请开始游戏.', 'game');
        Game.infoNodes.gameMessage.innerHTML = '请开始游戏';
    });

    //对手离开房间
    this.socket.on('leave', function () {
        Game.isReady = false;
        if (Game.isStart) {
            new Mask({
                content: '对手离开游戏，你赢了！'
            });
            Game.isStart = false;
            Game.infoNodes.startGame.disabled = false;
            Client.addLogs('对手离开游戏，请重新开始游戏.', 'game');
        } else {
            Client.addLogs('对手离开了房间，等待玩家加入.', 'game');
            Game.infoNodes.gameMessage.innerHTML = '对手离开了房间';
        }
    });


    //监听game事件，玩家走棋
    /*this.socket.on('game', function (data) {
     console.log(data);
     })

     this.socket.on('start', function (data) {
     console.log(data);
     })*/


    //发送join事件，加入房间
    this.socket.emit('join', this.getRoom());

};






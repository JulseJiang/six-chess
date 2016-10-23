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
    var hash = location.hash;
    return hash.substring(1);
};

/**
 * 添加一条日志
 * @param {string} text 日志内容
 * @param {boolean} isError 是否标记为错误信息
 */
Client.addLogs = function (text, isError) {
    var logs = document.getElementById('logs');
    var p = document.createElement('p');
    if (isError === true) {
        p.className = 'error';
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
    this.socket = io.connect('http://localhost:3001');
    Client.addLogs('正在连接...')

    //连接成功
    this.socket.on('connect', function () {
        Client.addLogs('连接成功！');
    });

    //连接失败
    this.socket.on('error', function () {
        Client.addLogs('连接失败！', true);
    });

    //失去连接
    this.socket.on('disconnect', function () {
        Client.addLogs('失去连接，正在重连...', true);
    });

    //发送conn事件，加入房间
    this.socket.emit('conn', this.getRoom());

    //发送game事件，玩家走棋
    this.socket.emit('game', this.getRoom(), Game.seed.data);

    //监听game事件，玩家走棋
    this.socket.on('game', function (data) {
        console.log(data);
    })

};
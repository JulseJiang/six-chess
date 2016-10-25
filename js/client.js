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
 * 计算二维数组倒置
 * @param {Array} data 原数组
 * @return {Array}
 */
Client.changeColor = function (data) {
    var _data = [[], [], [], []];
    data.forEach(function (d, i) {
        for (j = 0; j < d.length; j++) {
            if (d[j] === 1) {
                _data[i][j] = 2;
            } else if (d[j] === 2) {
                _data[i][j] = 1;
            } else {
                _data[i][j] = 0;
            }
        }
    });
    return _data;
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
        Game.isStarted = false;
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
            Game.infoNodes.startGame.disabled = false;
        }
    });

    //对手点击开始游戏
    this.socket.on('started', function () {
        Game.isStarted = true;
        if (Game.isStart) {
            Client.socket.emit('reallyStart', Client.getRoom());
        }
    });

    //双方点击开始，开始游戏
    this.socket.on('reallyStart', function (data) {
        Game.myChoose = data.myChoose;
        Game.loop = data.loop;
        Client.addLogs('游戏开始.', 'game');
        if (data.loop === data.myChoose) {
            Game.infoNodes.gameMessage.innerHTML = '你获得了先手';
            Game.infoNodes.loopColor.innerHTML = '我';
        } else {
            Game.infoNodes.gameMessage.innerHTML = '对手获得了先手';
            Game.infoNodes.loopColor.innerHTML = '对手';
        }
        document.querySelector('#chessList' + Game.myChoose).className = 'mine';
        //Game.initSeedData();
        Game.drawSeeds();
    });

    //监听game事件，玩家走棋
    this.socket.on('game', function (data) {
        Game.loop = data.loop;
        Game.seed.data = data.data;
        document.querySelector('#chessList1 .num').innerHTML = Game.getLength(1);
        document.querySelector('#chessList2 .num').innerHTML = Game.getLength(2);
        Game.infoNodes.loopColor.innerHTML = Game.loop === Game.myChoose ? '我' : '对手';
        Game.drawSeeds();

        var winner = Game.getWinner();
        if (winner >= 0) {
            var result = '';
            switch (winner) {
                case 0:
                    result = '平局';
                    break;
                default:
                    result = winner === Game.myChoose ? '你 ' : '对手 ' + '赢了';
            }
            var mask = new Mask({
                title: '游戏结果',
                content: '游戏结束：' + result
            });
            Game.isStart = false;
            Game.infoNodes.gameMessage.innerHTML = result;
        }
    });

    //监听认输事件
    this.socket.on('defeat', function (message) {
        new Mask({
            title: '认输',
            content: message
        });
        Game.init();
    });

    //监听对手和棋请求
    this.socket.on('peace', function () {
        var mask = new Mask({
            title: '和棋',
            content: '对手想要和棋，你同意吗',
            sureText: '同意',
            cancelText: '拒绝'
        }, function () {
            Client.socket.emit('surePeace', Client.getRoom(), true);
            mask.close();
        }, function () {
            Client.socket.emit('surePeace', Client.getRoom(), false);
            mask.close();
        });
    });

    //监听和棋事件
    this.socket.on('surePeace', function (message, isSure) {
        new Mask({
            title: '和棋',
            content: message
        });
        if (isSure) {
            Game.init();
        }
    });

    //发送join事件，加入房间
    this.socket.emit('join', this.getRoom());

};






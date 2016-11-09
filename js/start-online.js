/**
 * 在线联机版
 * Created by CHEN on 2016/10/23.
 */

//入口
window.onload = function () {
    Game.init();
    Game.handleInfoEvent();
    Client.init();
};

/**
 * 开始游戏
 */
Game.startOnlineGame = function () {
    Game.isStart = true;
    Client.socket.emit('start', Client.getRoom());
    Game.infoNodes.gameMessage.innerHTML = '等待对手开始游戏';
};

/**
 * 绑定游戏信息的相关事件
 */
Game.handleInfoEvent = function () {
    var startGame = document.getElementById('startGame');
    var showRooms = document.getElementById('showRooms');
    var defeat = document.getElementById('defeat');
    var peace = document.getElementById('peace');
    var undo = document.getElementById('undo');

    //开始游戏
    startGame.addEventListener('click', function (e) {
        if (!Game.isReady) {
            new Mask({
                content: '玩家还没有进入房间，无法开始游戏.'
            });
            return;
        }
        var target = e.target;
        target.disabled = true;
        Game.startOnlineGame();
    });

    //显示所有房间
    showRooms.addEventListener('click', function () {
        new Mask({
            title: '所有房间',
            content: '',
            sureText: '刷新',
            cancelText: '关闭'
        }, function (e) {
            Client.loadRooms();
        });
        Client.loadRooms();
    });

    //认输
    defeat.addEventListener('click', function () {
        if (!Game.isStart || !Game.isStarted) {
            return;
        }
        var mask = new Mask({
            title: '认输',
            content: '你确定要认输吗？'
        }, function () {
            Client.socket.emit('defeat', Client.getRoom());
            mask.close();
        });
    });

    //和棋
    peace.addEventListener('click', function () {
        if (!Game.isStart || !Game.isStarted) {
            return;
        }
        var mask = new Mask({
            title: '和棋',
            content: '你确定要和棋吗？'
        }, function () {
            Client.socket.emit('peace', Client.getRoom());
            mask.close();
        });
    });

    //悔棋
    undo.addEventListener('click', function () {
        if (!Game.isStart || !Game.isStarted) {
            return;
        }
        if (Game.isMoved === false) {
            /*new Mask({
                title: '悔棋',
                content: '你还没有走过棋，不能悔棋'
            });*/
            return;
        } else {
            var mask = new Mask({
                title: '悔棋',
                content: '你确定要悔棋吗？'
            }, function () {
                Client.socket.emit('undo', Client.getRoom());
                mask.close();
            });
        }

    });
};

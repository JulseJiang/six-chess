/**
 * 离线单机版
 * Created by CHEN on 2016/10/22.
 */

//入口
window.onload = function () {
    Game.init();
    Game.handleInfoEvent();
};

/**
 * 开始单机游戏
 */
Game.startSingleGame = function () {
    this.isStart = true;
    this.loop = 1;
    this.infoNodes.loopColor.innerHTML = this.seed.colorText[this.loop - 1];
    this.infoNodes.gameMessage.innerHTML = '游戏中...';
};

/**
 * 绑定游戏信息的相关事件
 */
Game.handleInfoEvent = function () {
    var startGame = document.getElementById('startGame');
    var changeOnline = document.getElementById('changeOnline');
    var defeat = document.getElementById('defeat');
    var peace = document.getElementById('peace');
    var startAgain = document.getElementById('startAgain');

    //开始游戏
    startGame.addEventListener('click', function (e) {
        var target = e.target;
        target.disabled = true;
        Game.startSingleGame();
    });

    //在线联机
    changeOnline.addEventListener('click', function () {
        var room;
        if (localStorage && localStorage.getItem('myRoom').length == 10) {
            room = localStorage.getItem('myRoom');
        } else {
            room = hex_md5(new Date() + Math.random()).substr(0, 10);
        }
        var i = location.pathname.indexOf('/', 1);
        var path = location.pathname.substring(0, i);
        var url = location.protocol + '//' + location.host + path + '/online.html?' + room;
        new Mask({
            title: '在线游戏',
            content: '请将下面的网站复制给好友：<p style="margin-top: 10px;text-decoration: underline;color: #666">' + url + '</p>',
            sureText: '复制网址并进入在线版',
            cancelText: '关闭'
        }, function (e) {
            var target = e.target;
            var clipboard = new Clipboard('#alert .sureBtn', {
                target: function () {
                    return document.querySelector('#alert .content p');
                }
            });
            clipboard.on('success', function (e) {
                target.disabled = true;
                target.innerHTML = '已复制';
                //e.clearSelection();
                location.href = e.text;
            });
            clipboard.on('error', function (e) {
                alert('复制失败！请手动复制');
            });
        })
    });

    //认输
    defeat.addEventListener('click', function () {
        if (!Game.isStart) {
            return;
        }
        new Mask({
            title: '认输',
            content: '单机版无法认输！'
        });
    });

    //和棋
    peace.addEventListener('click', function () {
        if (!Game.isStart) {
            return;
        }
        new Mask({
            title: '和棋',
            content: '单机版无法和棋！'
        });
    });

    //重新开始
    startAgain.addEventListener('click', function () {
        var mask = new Mask({
            title: '重新开始',
            content: '您确定要重新开始游戏吗？'
        }, function (e) {
            Game.init();
            mask.close();
        });
    });
}

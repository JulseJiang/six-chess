var Chess = {
    choose: 1, //选择的棋子颜色(1 or 2)
    board: {
        x: 50, //棋盘左上角位置x
        y: 50, //棋盘左上角位置y
        width: 480, //长度能被3整除
        height: 480, //宽度能被3整除
        lineWidth: 12, //线宽为偶数
        lineColor: '#ccc', //棋盘线颜色
        bgColor: '#fffce4' //棋盘背景颜色
    },
    seed: {
        radius: 40, //棋子圆形半径
        data: [],  //棋子的二维数组数据(数组的值有 0 1 2，其中0表示该位置没有棋子，1 or 2表示玩家的棋子)
        colors: [['#000', '#666'], ['#d5d5d5', '#f5f5f5']], //棋子渐变颜色
    }
};

var canvas = CE.defines('main')
    .ready(function () {
        canvas.Scene.call('Chess');
    });

/**
 * 创建场景Chess
 */
canvas.Scene.New({
    name: 'Chess',

    /**
     * 绘制棋盘
     */
    drawBoard: function (stage) {
        var _board = [];
        var x = Chess.board.x;
        var y = Chess.board.y;
        var width = Chess.board.width;
        var height = Chess.board.height;
        var lineWidth = Chess.board.lineWidth;
        var bgColor = Chess.board.bgColor;
        var lineColor = Chess.board.lineColor;
        var halfLineWidth = parseInt(lineWidth / 2);

        //棋盘外边框
        var rect = this.createElement();
        rect.lineWidth = lineWidth;
        rect.strokeStyle = lineColor;
        rect.strokeRect(x, y, width, height);

        //棋盘背景
        var background = this.createElement();
        background.fillRect(bgColor, x + halfLineWidth, y + halfLineWidth, width - lineWidth, height - lineWidth);

        /**
         * 返回绘制棋盘线的Class
         * @param x1:线开始位置x
         * @param y1:线开始位置y
         * @param x2:线结束位置x
         * @param y2:线结束位置y
         * @returns {Class}
         */
        var drawLine = function (x1, y1, x2, y2) {
            var line = this.createElement();
            line.lineWidth = lineWidth;
            line.strokeStyle = lineColor;
            line.beginPath();
            line.moveTo(x1, y1);
            line.lineTo(x2, y2);
            line.stroke();
            return line;
        }.bind(this);
        var h_line1 = drawLine(x, y + (height / 3), x + width, y + (height / 3));
        var h_line2 = drawLine(x, y + (height * 2 / 3), x + width, y + (height * 2 / 3));
        var v_line1 = drawLine(x + (width / 3), y, x + (width / 3), y + height);
        var v_line2 = drawLine(x + (width * 2 / 3), y, x + (width * 2 / 3), y + height);

        stage.append(rect, background, h_line1, h_line2, v_line1, v_line2);
    },

    /**
     * 绘制棋子
     */
    drawSeed: function (stage) {
        var _seed = [];
        var data = Chess.seed.data;
        var colors = Chess.seed.colors;

        /**
         * 显示可能移动的位置坐标
         * @param i :点击位置在二维数组的第i行
         * @param j :点击位置在二维数组的第j列
         */
        var getSite = function (i, j) {
            var up = [i - 1, j];
            var down = [i + 1, j];
            var left = [i, j - 1];
            var right = [i, j + 1];
            var site = [];
            site.push(up, down, left, right);

            return site.filter(function (s) {
                var i = s[0];
                var j = s[1];
                return s[0] >= 0 && s[0] <= 3 && s[1] >= 0 && s[1] <= 3 && Chess.seed.data[j][i] === 0;
            });
        };

        /**
         * 绘制点击棋子可能移动到的位置（透明显示）
         * @param site ：二维数组 用来绘制可能移动的位置的坐标
         * @param _i : 之前点击棋子横坐标
         * @param _j : 之前点击棋子纵坐标
         */
        var drawPossible = function (site, _i, _j) {
            var draw = function (i, j) {
                var board = Chess.board;
                var radius = Chess.seed.radius;
                var colors = Chess.seed.colors;
                var x_spacing = board.width / 3;
                var y_spacing = board.height / 3;
                var x = board.x + i * x_spacing;
                var y = board.y + j * y_spacing;

                //possible棋子
                var seed = this.createElement();
                var color1 = colors[Chess.choose - 1][0];
                var color2 = colors[Chess.choose - 1][1];
                var grd = this.getCanvas().createRadialGradient(x, y, radius / 2, x + parseInt(radius / 10), y - parseInt(radius / 10), radius); //圆形渐变
                grd.addColorStop(0, color1);
                grd.addColorStop(1, color2);
                seed.opacity = 0.5;
                seed.fillStyle = grd;
                seed.fillCircle(x, y, radius);
                //点击possible棋子事件
                seed.on('click', function (e) {
                    Chess.seed.data[_i][_j] = 0;
                    Chess.seed.data[i][j] = Chess.choose;
                    console.log(data);
                    //this.drawSeed(stage);
                }.bind(this));
                return seed;
            }.bind(this);
            site.forEach(function (s) {
                stage.append(draw(s[0], s[1]));
            });
        }.bind(this);

        /**
         * 绘制圆形棋子
         * @param i : 二维数组横坐标
         * @param j : 二维数组纵坐标
         * @param color : 棋子颜色序号 (0 or 1)
         */
        var drawCircle = function (i, j, color) {
            var board = Chess.board;
            var radius = Chess.seed.radius;
            var colors = Chess.seed.colors;
            var x_spacing = board.width / 3;
            var y_spacing = board.height / 3;
            var x = board.x + i * x_spacing;
            var y = board.y + j * y_spacing;

            //棋子
            var seed = this.createElement();
            var color1 = colors[color - 1][0];
            var color2 = colors[color - 1][1];
            var grd = this.getCanvas().createRadialGradient(x, y, radius / 2, x + parseInt(radius / 10), y - parseInt(radius / 10), radius); //圆形渐变
            if (color == Chess.choose) {
                grd.addColorStop(0, color1);
                grd.addColorStop(1, color2);
                seed.fillStyle = grd;
                seed.fillCircle(x, y, radius);
                //点击棋子事件
                seed.on('click', function (e) {
                    this.save()
                    this.fillStyle = '#f00';
                    //console.log(this);
                    //this.remove();
                    var site = getSite(i, j);
                    drawPossible(site, i, j);

                });
            } else if (color == 3 - Chess.choose) {
                grd.addColorStop(0, color1);
                grd.addColorStop(1, color2);
                seed.fillStyle = grd;
                seed.fillCircle(x, y, radius);
            }
            return seed;
        }.bind(this);
        Chess.seed.data.forEach(function (data, i, arr) {
            for (var j = 0; j < data.length; j++) {
                if (data[j] > 0) {
                    var c = drawCircle(j, i, data[j]);
                    if (data[j] > 0)
                        stage.append(c);
                }
            }
        });
    },

    /**
     * 初始化棋子（初始化棋子的二维数组数据）
     */
    initSeed: function () {
        var choose = Chess.choose;
        var other = 3 - choose;
        var row1 = [other, other, other, other];
        var row2 = [other, 0, 0, other];
        var row3 = [choose, 0, 0, choose];
        var row4 = [choose, choose, choose, choose];
        Chess.seed.data.push(row1, row2, row3, row4);
    }
    ,

    /**
     * 验证数据
     */
    valid: function () {
        //验证选择棋子颜色
        if (Chess.choose !== 1 && Chess.choose !== 2) throw new Error('Chess.choose的值必须为1或2.');

        //验证棋盘数据
        var board = Chess.board;
        if (board.x <= 0) console.warn('Chess.board.x的值推荐不小于0.');
        if (board.y <= 0) console.warn('Chess.board.y的值推荐不小于0.');
        if (board.width % 3 !== 0) console.warn('Chess.board.width的值推荐是一个能被3整除的数.');
        if (board.height % 3 !== 0) console.warn('Chess.board.height的值推荐是一个能被3整除的数.');
        if (board.width !== board.height) console.warn('推荐Chess.board.width的值与Chess.board.height的值相等.');
        if (board.lineWidth % 2 !== 0) console.warn('Chess.board.lieWidth的值推荐是一个偶数.');

        //验证棋子数据
        //var seed = Chess.seed;
        //if (seed.colors.length !== 3) throw new Error('Chess.seed.colors是一个长度为3的数组.');
        //if (seed.colors[1] === seed.colors[2]) console.warn('Chess.seed.colors第2个和第3个元素推荐不相同');
    }
    ,

    ready: function (stage) {
        //添加绘制棋盘
        this.drawBoard(stage);
        //初始化棋子数据
        this.initSeed();
        //验证数据
        this.valid();
        //添加绘制棋子
        this.drawSeed(stage);
    }
})
;


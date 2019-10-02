var config = {
    width: 1366,
    height: 768,
    rows: 4,
    cols: 4,
    wrapper: document.getElementsByClassName('wrapper')[0],
    imgUrl: '1.jpg', //图片路径，注意：相对的是页面路径
    isOver: false
};

config.blockWidth = config.width / config.cols;
config.blockHeight = config.height / config.rows;
config.blockNumber = config.rows * config.cols;

var blocks = [];

function Block(left, top, row, col, isVisible) {
    this.left = left;
    this.top = top;
    this.row = row;
    this.col = col;
    this.correctLeft = left;
    this.correctTop = top;
    this.correctRow = row;
    this.correctCol = col;
    this.isVisible = isVisible;
    this.dom = document.createElement('div');
    this.dom.style.position = 'absolute';
    // this.dom.style.left = this.left + 'px';
    // this.dom.style.top = this.top + 'px';
    this.dom.style.width = config.blockWidth + 'px';
    this.dom.style.height = config.blockHeight + 'px';
    this.dom.style.background = `url(${config.imgUrl}) -${this.correctLeft}px -${this.correctTop}px`;
    this.dom.style.border = '1px solid #ccc';
    this.dom.style.boxSizing = 'border-box';
    this.dom.style.cursor = 'pointer';

    if (!isVisible) {
        this.dom.style.display = 'none';
    }

    config.wrapper.appendChild(this.dom);

    this.show = function () {
        this.dom.style.left = this.left + 'px';
        this.dom.style.top = this.top + 'px';
    }

    this.isCorrect = function () {
        this.row === this.correctRow && this.col === this.correctCol;
    }

    this.show();
}

/**
 * 获取随机数组索引
 * @param {*} min 
 * @param {*} max 
 */
function getRandomIdex(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

/**
 * 初始化游戏
 */
function init() {
    // 初始化游戏容器
    initWrapper();
    // 初始化小块
    initBlockArray();
    // 洗牌
    blockShuffle();
    // 注册点击事件
    bindEvent();

    /**
     * 初始化容器
     */
    function initWrapper() {
        var wrapper = config.wrapper;
        wrapper.style.position = 'relative';
        wrapper.style.width = config.width + 'px';
        wrapper.style.height = config.height + 'px';
        wrapper.style.border = '1px solid #ccc';
    }

    /**
     * 初始化方块数组
     */
    function initBlockArray() {
        var rows = config.rows,
            cols = config.cols,
            blockWidth = config.blockWidth,
            blockHeight = config.blockHeight;

        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var left = j * blockWidth,
                    top = i * blockHeight,
                    isVisible = true;;
                if (i === rows - 1 && j === cols - 1) {
                    isVisible = false;
                }
                var block = new Block(left, top, i, j, isVisible);
                blocks.push(block);
            }

        }
    }

    /**
     * 方块洗牌
     */
    function blockShuffle() {
        for (var i = 0; i < blocks.length - 1; i++) {
            var exchangeIndex = getRandomIdex(0, blocks.length - 2);
            exchange(blocks[i], blocks[exchangeIndex]);
        }
    }

    /**
     * 交换两个方块的left，top，row，col
     * @param {*} b1 
     * @param {*} b2 
     */
    function exchange(b1, b2) {
        var temp = b1.left;
        b1.left = b2.left;
        b2.left = temp;

        temp = b1.top;
        b1.top = b2.top;
        b2.top = temp;

        temp = b1.row;
        b1.row = b2.row;
        b2.row = temp;

        temp = b1.col;
        b1.col = b2.col;
        b2.col = temp;

        b1.show();
        b2.show();
    }

    /**
     * 绑定方块点击事件
     */
    function bindEvent() {
        var invisibleBlock = blocks.find(block => {
            return !block.isVisible;
        });

        blocks.forEach(block => {
            block.dom.onclick = function () {
                if (config.isOver) return;

                var tempRow = invisibleBlock.row,
                    tempCol = invisibleBlock.col,
                    row = block.row,
                    col = block.col;
                if (row == tempRow && Math.abs(col - tempCol) === 1
                    ||
                    col === tempCol && Math.abs(row - tempRow) === 1) {
                    exchange(invisibleBlock, block);
                    isWin();
                }
            }

            // 测试
            // block.dom.onclick = function () {
            //     if (config.isOver) return;
            //     exchange(invisibleBlock, block);
            //     isWin();
            // }
        });
    }

    /**
     * 判断游戏是否胜利
     */
    function isWin() {
        var isOver = blocks.some(block => {
            return !block.isCorrect();
        });

        if (!isOver) {
            config.isOver = true;
            blocks.forEach(block => {
                block.dom.style.display = 'block';
                block.dom.style.border = 'none';
            });
        }
    }


}

init();
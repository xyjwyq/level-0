// 辅助函数
function getTimer(callback, duration, thisArg) {
    var timer = null;
    return {
        start: function () {
            timer = setInterval(callback.bind(thisArg), duration);
        },
        stop: function () {
            clearInterval(timer);
            timer = null;
        }
    }
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

var query = document.querySelector.bind(document);

// 游戏对象
var game = {
    dom: query('.game'),
    overDom: query('.game .over'),
    scoreDom: query('.score'),
    isPaused: false, // s是否处于暂停装热爱
    isOver: false, // 是否已经结束
    start: function () {
        sky.skyTimer.start(); // 天空计时器
        land.landTimer.start(); // 大地计时器
        bird.xTimer.start(); // 小鸟在水平方向上的计时器
        bird.yTimer.start(); // 小鸟在竖直方向上的计时器
        pipeManager.produceTimer.start(); // 生产柱子
        pipeManager.moveTimer.start(); // 移动柱子
        hitManager.hitTimer.start(); // 碰撞检测
        scoreManager.scoreTimer.start(); // 分数计算
    },
    stop: function () {
        sky.skyTimer.stop();
        land.landTimer.stop();
        bird.xTimer.stop();
        bird.yTimer.stop();
        pipeManager.produceTimer.stop();
        pipeManager.moveTimer.stop();
        hitManager.hitTimer.stop();
        scoreManager.scoreTimer.stop();
    }
};
game.width = game.dom.clientWidth;
game.height = game.dom.clientHeight;

// 天空对象
var sky = {
    dom: query('.game .sky'),
    left: 0,
};

sky.skyTimer = getTimer(function () {
    this.left--;
    if (this.left <= -game.width) {
        this.left = 0;
    }
    this.dom.style.left = this.left + 'px';
}, 16, sky);

// 大地对象
var land = {
    dom: query('.game .land'),
    left: 0
};
land.width = land.dom.clientWidth;
land.height = land.dom.clientHeight;
land.top = game.height - land.height;

land.landTimer = getTimer(function () {
    this.left -= 2;
    if (this.left <= -game.width) {
        this.left = 0;
    }
    this.dom.style.left = this.left + 'px';
}, 16, land);

// 小鸟对象
var bird = {
    dom: query('.game .bird'),
    left: 150,
    top: 150,
    width: 33,
    height: 26,
    swingIndex: 0, // 翅膀索引，取值范围为0 ~2, 表示小鸟在不同时段的形态
    v: 0, // 小鸟运动速度
    t: 16, // 运动时间间隔
    g: 0.002, // 重力加速度
    show: function () {
        // 设置翅膀装填
        if (this.swingIndex === 0) {
            this.dom.style.backgroundPosition = '-8px -10px';
        } else if (this.swingIndex === 1) {
            this.dom.style.backgroundPosition = '-60px -10px';
        } else {
            this.dom.style.backgroundPosition = '-113px -10px';
        }
        // 设置小鸟位置
        this.dom.style.top = this.top + 'px';
        this.dom.style.left = this.left + 'px';
    },
    setTop: function (dis) {
        var min = 0;
        var max = land.top - this.height;
        // debugger;
        this.top = this.top + dis;

        if (this.top <= 0) {
            this.top = min;
        } else if (this.top >= max) {
            this.top = max;
        }

        this.show();
    },
    jump: function () {
        this.v = -0.5;
    },
    hitLand: function () {
        return this.top >= land.top - this.height;
    }
}

bird.xTimer = getTimer(function () {
    this.swingIndex = (this.swingIndex + 1) % 3;
    this.show();
}, 100, bird);

bird.yTimer = getTimer(function () {
    // 小鸟向下运动，应有重力加速度，为匀加数运动（不考虑空气阻力）
    var dis = this.v * this.t + this.g * this.t * this.t / 2;
    this.v = this.v + this.g * this.t;
    this.setTop(dis);
}, 16, bird);

// 管道对象

var pipeContainer = document.querySelector('.game .pipe_container');

/**
 * 柱子构造函数
 * @param {*} pos 柱子位置，取值为top/bottom 
 * @param {*} height 柱子高度
 */
function Pipe(pos, height) {
    this.width = Pipe.width;
    this.height = height;
    this.left = game.width;
    this.pos = pos;
    // 纵坐标
    if (pos == 'top') {
        this.top = 0;
    } else {
        this.top = land.top - this.height;
    }

    this.dom = document.createElement('div');
    this.dom.className = 'pipe pipe_' + pos;
    this.dom.style.top = this.top + 'px';
    this.dom.style.height = height + 'px';
    this.show();
    pipeContainer.appendChild(this.dom);
}

Pipe.prototype.show = function () {
    this.dom.style.left = this.left + 'px';
}

Pipe.prototype.isHitBird = function () {
    var bx = bird.left + bird.width / 2,
        by = bird.top + bird.height / 2,
        px = this.left + this.width / 2,
        py = this.top + this.height / 2;
    if (Math.abs(bx - px) <= (bird.width + this.width) / 2 &&
        Math.abs(by - py) <= (bird.height + this.height) / 2) {
        return true;
    }
    return false;
}

Pipe.width = 52;

PipePair.prototype.minHeight = 60;
PipePair.prototype.gap = 150;
PipePair.prototype.maxHeight = land.top - 210;

/**
 * 生成一对柱子
 */
function PipePair() {
    var height = getRandom(this.minHeight, this.maxHeight);
    this.topPipe = new Pipe('top', height);
    this.bottomPipe = new Pipe('bottom', land.top - this.gap - height);
    this.left = this.topPipe.left;
}

PipePair.prototype.show = function () {
    this.topPipe.left = this.left;
    this.bottomPipe.left = this.left;
    this.topPipe.show();
    this.bottomPipe.show();
}

PipePair.prototype.remove = function () {
    this.topPipe.dom.remove();
    this.bottomPipe.dom.remove();
}

PipePair.prototype.isHitBird = function () {
    if (this.topPipe.isHitBird() || this.bottomPipe.isHitBird()) {
        return true;
    }
    return false;
}

PipePair.prototype.isBirdPass = function() {
    if (this.left + Pipe.width <= bird.left) {
        this.isPassed = true;
        return true;
    }
}

// 柱子管理其
var pipeManager = {
    pairs: []
};

pipeManager.produceTimer = getTimer(function () {
    this.pairs.push(new PipePair());
}, 1500, pipeManager);

pipeManager.moveTimer = getTimer(function () {
    for (var i = 0; i < this.pairs.length; i++) {
        var pipePair = this.pairs[i];
        pipePair.left -= 2;
        // 由于不断的产生柱子，会导致柱子dom不断增加，增加页面压力，耗费性能，需要在一定条件移除柱子
        if (pipePair.left <= -Pipe.width) {
            pipePair.remove();
            this.pairs.splice(i, 1);
            i--;
        } else {
            pipePair.show();
        }
    }
}, 16, pipeManager);

// 碰撞检测
var hitManager = {
    validate: function () {
        // 检测小鸟与地面的是否碰撞
        if (bird.hitLand()) {
            return true
        }
        // 检查小鸟与柱子之间的碰撞
        for (var i = 0; i < pipeManager.pairs.length; i++) {
            if (pipeManager.pairs[i].isHitBird()) {
                return true
            }
        }
        return false;
    }
}

hitManager.hitTimer = getTimer(function() {
    if (hitManager.validate()) {
        game.isOver = true;
        game.overDom.style.display = 'block';
        // game.overDom.querySelector('.over_score span').innerText = game.scoreDom.children[0].innerText;
        game.overDom.querySelector('.over_score span').innerText = scoreManager.score;
        game.stop();
    }

}, 16, hitManager);

// 获取分数
var scoreManager = {
    score: 0,
    getScore: function() {
        for (var i = 0; i < pipeManager.pairs.length; i++) {
            var pair = pipeManager.pairs[i];
            if (!pair.isPassed && pair.isBirdPass()) {
                this.score++;
            }
        }
    },
    showScore: function() {
        game.scoreDom.children[0].innerText = this.score;
    }
}

scoreManager.scoreTimer = getTimer(function() {
    this.getScore();
    this.showScore();
}, 16, scoreManager);


// 注册事件
window.onkeypress = function (e) {
    
    if (e.key === 'Enter') {
        if (game.isOver) {
            location.reload();
            return;
        }
        if (game.isPaused) {
            game.isPaused = false;
            game.start();
        } else {
            game.isPaused = true;
            game.stop();
        }

    } else if (e.key === ' ') {
        bird.jump();
    }
}



game.start();
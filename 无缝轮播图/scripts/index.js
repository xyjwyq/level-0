var config = {
    imageWidth: 520,
    dotWidth: 12,
    doms: {
        divBanner: document.querySelector('.banner'),
        divImages: document.querySelector('.images'),
        divDots: document.querySelector('.dots'),
        divArrow: document.querySelector('.arrow')
    },
    curIndex: 0, // 不考虑为达到无缝轮播添加的图片，取值范围为 0 ~ imageNum - 1
    timer: {
        duration: 16, // 多长时间移动一次
        totalTime: 300, // 每一次运动完成时间
        id: null // 计时器id

    },
    autoTimer: null
}
config.imageNum = config.doms.divImages.children.length;

/**
 * 初始化图片容器与索引容器宽度
 */
function initSize() {
    config.doms.divImages.style.width = config.imageWidth * (config.imageNum + 2) + 'px';
    config.doms.divDots.style.width = config.dotWidth * config.imageNum + 'px';
}

/**
 * 初始化图片元素(为达到无缝轮播，在收尾各添加一张图片)
 */
function initElements() {
    var children = config.doms.divImages.children,
        first = children[0], last = children[children.length - 1];
    // 最开始添加最后一张图片
    var cloneDom = last.cloneNode(true);
    config.doms.divImages.insertBefore(cloneDom, first);
    // 最末尾添加第一张图片
    cloneDom = first.cloneNode(true);
    config.doms.divImages.appendChild(cloneDom);
}

/**
 * 设置正确的图片位置初始值（排除额为添加的图片影响）
 */
function initImagePosition() {
    var mLeft = (-config.curIndex - 1) * config.imageWidth;
    config.doms.divImages.style.marginLeft = mLeft + 'px';
}

/**
 * 设置选中的索引，将其变为选中状态
 */
function setActiveDots() {
    var children = config.doms.divDots.children,
        len = children.length;
    for (var i = 0; i < len; i++) {
        if (i === config.curIndex) {
            children[i].classList.add('active');
        } else {
            children[i].classList.remove('active');

        }
    }
}

function init() {
    initSize();
    initElements();
    initImagePosition();
    setActiveDots();
}

init();

/**
 * 切换到某一个图片索引
 * @param {*} index 要切换的图片索引
 * @param {*} dir 图片运动方向，取值为’leftToRight‘/'rightToLeft'
 */
function switchTo(index, dir) {
    if (index === config.curIndex) return;
    dir = dir || 'leftToRight';

    // 最终的位置
    var tarLeft = (-index - 1) * config.imageWidth;
    animateSwitch(tarLeft, dir);

    //重新设置索引
    config.curIndex = index;
    setActiveDots();
}

/**
 * 切换动画
 * @param {*} tarLeft 
 * @param {*} dir 
 */
function animateSwitch(tarLeft, dir) {
    stopAnimate();
    // 运动次数
    var times = Math.ceil(config.timer.totalTime / config.timer.duration)
    // 每次运动距离
    var mLeft = parseFloat(getComputedStyle(config.doms.divImages).marginLeft),
        totalaWidth = config.imageWidth * config.imageNum, // 不包含额外的图片宽度
        dis = 0,
        everyDis = 0,
        curTimes = 0; // 当前已经运动次数
    if (dir === 'leftToRight') {
        if (tarLeft < mLeft) {
            dis = tarLeft - mLeft;
        } else {
            dis = -(totalaWidth - Math.abs(tarLeft - mLeft));
        }
    } else if (dir === 'rightToLeft') {
        if (tarLeft > mLeft) {
            dis = tarLeft - mLeft;
        } else {
            dis = totalaWidth - Math.abs(tarLeft - mLeft);
        }
    }
    everyDis = dis / times;
    config.timer.id = setInterval(function () {
        mLeft += everyDis;
        // 判断首尾临界情况
        if (dir === 'leftToRight' && Math.abs(mLeft) > totalaWidth) {
            mLeft += totalaWidth;
        } else if (dir === 'rightToLeft' && Math.abs(mLeft) < config.imageWidth) {
            mLeft -= totalaWidth;
        }
        curTimes++;
        config.doms.divImages.style.marginLeft = mLeft + 'px';
        // 停止条件
        if (curTimes === times) {
            stopAnimate();
        }
    }, config.timer.duration);


}

/**
 * 停止动画
 */
function stopAnimate() {
    clearInterval(config.timer.id);
    config.timer.id = null;
}

// 注册左右按钮事件
config.doms.divArrow.onclick = function (e) {
    if (e.target.classList.contains('left')) {
        rightTo();
    } else if (e.target.classList.contains('right')) {
        leftTo();
    }
}

/**
 * 自左向右
 */
function leftTo() {
    var index = config.curIndex + 1;
    if (index > config.imageNum - 1) {
        index = 0;
    }
    switchTo(index, 'leftToRight');
}

/**
 * 自右向左
 */
function rightTo() {
    var index = config.curIndex - 1;
    if (index < 0) {
        index = config.imageNum - 1;
    }
    switchTo(index, 'rightToLeft');
}

// 注册小圆点点击事件
config.doms.divDots.onclick = function (e) {
    if (e.target.tagName === 'SPAN') {
        var index = Array.from(this.children).indexOf(e.target),
            dir = index > config.curIndex ? 'leftToRight' : 'rightToLeft';
        switchTo(index, dir);
    }
}

// 自动运动
// config.autoTimer = setInterval(leftTo, config.timer.totalTime + 700);
function autoMove() {
    config.autoTimer = setInterval(leftTo, 2000);
}

config.doms.divBanner.onmouseenter = function () {
    clearInterval(config.autoTimer);
    config.autoTimer = null;
}

config.doms.divBanner.onmouseleave = function () {
    if (config.autoTimer) {
        return;
    }
    autoMove();
}

autoMove();






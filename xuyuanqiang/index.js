var wrapper = document.querySelector('.wrapper'),
    input = document.querySelector('input'),
    paperWidth = 170,
    paperHeight = 170,
    bottomDis = 70,
    vWidth = document.documentElement.clientWidth,
    vHeight = document.documentElement.clientHeight;

// 实现拖拽功能
window.onmousedown = function (e) {
    var moveDiv = getMoveDiv(e.target);
    if (!moveDiv) return;

    var style = getComputedStyle(moveDiv),
        left = parseFloat(style.left),
        top = parseFloat(style.top),
        disX = e.pageX - left,
        disY = e.pageY - top;
    window.onmousemove = function (e) {
        var newLeft = e.pageX - disX,
            newTop = e.pageY - disY;
        if (newLeft < 0) {
            newLeft = 0;
        }
        if (newLeft > document.documentElement.clientWidth - paperWidth) {
            newLeft = document.documentElement.clientWidth - paperWidth;
        }
        if (newTop < 0) {
            newTop = 0;
        }
        if (newTop > document.documentElement.clientHeight - paperHeight - bottomDis) {
            newTop = document.documentElement.clientHeight - paperHeight - bottomDis;
        }
        moveDiv.style.left = newLeft + 'px';
        moveDiv.style.top = newTop + 'px';
    }

    window.onmouseleave = window.onmouseup = function () {
        window.onmousemove = null;
    }
};

/**
 * 发布愿望
 * @param {String} words 
 */
function publishWWish(words) {
    var div = document.createElement('div');
    div.className = 'paper';
    div.innerHTML = `<p>${words}</p>
                     <span class="close">X</span>`;
    // 设置随机颜色
    div.style.backgroundColor = `rgb(${getRandom(100, 200)}, ${getRandom(100, 200)}, ${getRandom(100, 200)})`
    // 设置随机位置
    var maxLeft = document.documentElement.clientWidth - paperWidth,
        maxTop = document.documentElement.clientHeight - paperHeight - bottomDis;
    div.style.left = getRandom(0, maxLeft) + 'px';
    div.style.top = getRandom(0, maxTop) + 'px';
    wrapper.appendChild(div);
}

/**
 * 初始化愿望墙
 */
function initWishes() {
    var wishes = ['世界和平', '微微', '小谷粒'];
    wishes.forEach(wish => publishWWish(wish));
}

// 输入愿望并发布
input.onkeypress = function (e) {
    if (e.key === 'Enter' && this.value.trim()) {
        publishWWish(this.value);
        this.value = '';
    }
}

// 撤销愿望
window.onclick = function (e) {
    if (e.target.parentElement
        && e.target.parentElement.classList.contains('paper')
        && e.target.tagName === 'SPAN') {
        e.target.parentElement.remove();
    }
}

// 重置窗口宽度
window.onresize = function (e) {
    var curWIdth = document.documentElement.clientWidth,
        curHeight = document.documentElement.clientHeight,
        disWidth = curWIdth - vWidth,
        disHeight = curHeight -vHeight,
        papers = document.querySelectorAll('.paper');
    for(var i = 0; i < papers.length; i++) {
        var curDom = papers[i],
            style = getComputedStyle(curDom),
            left = parseFloat(style.left),
            right = vWidth - paperWidth -left,
            top = parseFloat(style.top),
            bottom = vHeight - top - paperHeight;
        
        var disLeft = left / (left + right) * disWidth,
            disTop = top / (top + bottom) * disHeight;
        curDom.style.left = left + disLeft + 'px';
        curDom.style.top = top + disTop + 'px';   
    }
    vWidth = curWIdth;
    vHeight = curHeight;
    
}


/**
 * 获取paper元素
 * @param {*} dom 
 */
function getMoveDiv(dom) {
    if (dom.classList.contains('paper')) {
        return dom;
    } else if (dom.parentElement
        && dom.parentElement.classList.contains('paper')
        && dom.tagName === 'P') {
        return dom.parentElement;
    }
}

/**
 * 获取某个范围内的随机数
 * @param {*} min 
 * @param {*} max 
 */
function getRandom(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

initWishes();

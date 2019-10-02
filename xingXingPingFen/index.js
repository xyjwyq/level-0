var starsWrapper = document.getElementsByClassName('stars')[0];
var wordWrapper = document.getElementsByClassName('word')[0];
var words = ["满意", "一般满意", "还不错", "很满意", "非常满意"];
var star = -1;//记录评分，点击的是第几个星星

starsWrapper.onmouseover = function (e) {
    if (e.target.tagName === 'IMG') {
        //替换当前empty图片
        var shining = './images/shining.png',
            emptyStar = './images/empty.png';
        e.target.src = shining;
        // 找发哦目标元素之前的所欲img元素
        var prev = e.target.previousElementSibling;
        while (prev) {
            prev.src = shining;
            prev = prev.previousElementSibling;
        }
        // 找出目标元素后面所有的img元素，并替换为empty
        var next = e.target.nextElementSibling;
        while (next) {
            next.src = emptyStar;
            next = next.nextElementSibling;
        }
        // 处理文字
        var index = Array.from(this.children).indexOf(e.target);
        wordWrapper.innerHTML = words[index];
    }
}

starsWrapper.onmouseleave = function (e) {
    wordWrapper.innerHTML = words[star] || '';
    var children = this.children;
    if (star < 0) {
        Array.from(children).forEach(ele => ele.src = './images/empty.png');

    }
}

starsWrapper.onclick = function (e) {
    if (e.target.tagName === 'IMG') {
        star = Array.from(this.children).indexOf(e.target);
    }
}
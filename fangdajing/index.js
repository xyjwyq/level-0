(function init() {
    var config = {
        smallBg: 'images/mouse.jpg',
        bigBg: 'images/mouseBigSize.jpg',
        divSmall: document.querySelector('.small'),
        divBig: document.querySelector('.big'),
        divMove: document.querySelector('.small .move'),
        smallDivSize: {
            width: 350,
            height: 350
        },
        bigDivSize: {
            width: 540,
            height: 540
        },
        bigImageSize: {
            width: 800,
            height: 800
        }
    };
    config.moveDivSize = {
        width: config.bigDivSize.width / config.bigImageSize.width * config.smallDivSize.width,
        height: config.bigDivSize.height / config.bigImageSize.height * config.smallDivSize.height
    }

    initDivBg();
    initMoveDiv();
    bindSmallDivEvent();


    /**
     * 初始化div背景
     */
    function initDivBg() {
        config.divSmall.style.background = `url(${config.smallBg}) no-repeat left top/contain`;
        config.divBig.style.background = `url(${config.bigBg}) no-repeat`;
    }

    /**
     * 初始化移动div
     */
    function initMoveDiv() {
        // 设置移动div大小
        config.divMove.style.width = config.moveDivSize.width + 'px';
        config.divMove.style.height = config.moveDivSize.height + 'px';
    }

    /**
     * 为small div绑定事件
     */
    function bindSmallDivEvent() {
        config.divSmall.onmouseenter = function () {
            config.divMove.style.display = 'block';
            config.divBig.style.display = 'block';
        }
        config.divSmall.onmouseleave = function () {
            config.divMove.style.display = 'none';
            config.divBig.style.display = 'none';
        }
        config.divSmall.onmousemove = function (e) {
            var offset = getOffset(e);
            setMovePosition(offset);
            setBigDivBg();

        }
    }

    /**
     * 根据鼠标事件参数，得到鼠标在divsmall中的坐标
     * @param {MouseEvent} e 
     */
    function getOffset(e) {
        if (e.target === config.divSmall) {
            return {
                x: e.offsetX,
                y: e.offsetY
            }
        } else {
            var moveComputedstyle = getComputedStyle(config.divMove),
                smallComputedStyle = getComputedStyle(config.divSmall),
                left = parseFloat(moveComputedstyle.left),
                top = parseFloat(moveComputedstyle.top),
                borderWidth = parseFloat(smallComputedStyle.borderWidth);
            return {
                x: e.offsetX + left + borderWidth,
                y: e.offsetY + top + borderWidth
            }
        }
    }

    /**
     * 根据鼠标坐标，设置divMove的坐标
     * @param {Object} offset 
     */
    function setMovePosition(offset) {
        var left = offset.x - config.moveDivSize.width / 2,
            top = offset.y - config.moveDivSize.height / 2,
            disWidth = config.smallDivSize.width - config.moveDivSize.width,
            disHeight = config.smallDivSize.height - config.moveDivSize.height;

        if (left < 0) {
            left = 0;
        }
        if (top < 0) {
            top = 0;
        }

        if (left > disWidth) {
            left = disWidth;
        }

        if (top > disHeight) {
            top = disHeight;
        }

        config.divMove.style.left = left + 'px';
        config.divMove.style.top = top + 'px';
    }

    /**
     * 设置big div中的背景图显示
     */
    function setBigDivBg() {
        var moveComputedstyle = getComputedStyle(config.divMove),
            left = parseFloat(moveComputedstyle.left),
            top = parseFloat(moveComputedstyle.top),
            bigLeft = left / config.smallDivSize.width * config.bigImageSize.width,
            bigTop = top / config.smallDivSize.height * config.bigImageSize.height;
        config.divBig.style.backgroundPosition = `-${bigLeft}px -${bigTop}px`;
    }
})()
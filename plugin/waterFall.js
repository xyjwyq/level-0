if (!this.myPlugin) {
    this.myPlugin = {};
}

this.myPlugin.waterFall = function (option) {
    var defualtOption = {
        minGap: 10,
        imgSrc: [],
        imgWidth: 220,
        container: document.body
    };
    option = Object.assign({}, defualtOption, option);
    var imgDoms = [];

    // 窗口尺寸变化事件
    var debounceSetImgPos = myPlugin.debounce(setImgPos, 300);
    window.onresize = debounceSetImgPos;

    // 设置容器元素的position
    setContainerPos();
    // 创建图片元素
    createImgs();

    /**
    * 设置容器元素的position为定位元素
    */
    function setContainerPos() {
        if (getComputedStyle(option.container).position === 'static') {
            option.container.style.position = 'relative';
        }
    }

    /**
     * 创建图片元素
     */
    function createImgs() {
        option.imgSrc.forEach(imgUrl => {
            var img = document.createElement('img');
            img.style.position = 'absolute';
            img.style.width = option.imgWidth + 'px';
            img.style.transition = 'all .5s';
            img.onload = debounceSetImgPos; // 函数节流
            img.src = imgUrl;
            imgDoms.push(img);
            option.container.appendChild(img);
        });
    }

    /**
     * 获取容器水平方向上的信息(padding盒宽度，每行放置图片数量，图片之间的间隙值)
     */
    function getHorazontalInfo() {
        var info = {};
        // 获取容器元素的padding盒宽度
        info.containerWidth = option.container.clientWidth;
        // 计算每一行能防止图片的数量
        info.imgNumEveeryRow = (info.containerWidth + option.minGap) / (option.imgWidth + option.minGap);
        info.imgNumEveeryRow = Math.floor(info.imgNumEveeryRow);
        // 根据每一行能放置的图片数量与容器宽度，重新计算图片之间的间隙
        if (info.imgNumEveeryRow === 1) {
            info.gap = info.containerWidth - option.imgWidth;
        } else {
            info.gap = (info.containerWidth - info.imgNumEveeryRow * option.imgWidth) / (info.imgNumEveeryRow - 1);
        }
        return info;
    }

    /**
     * 设置每张图片的top和left值
     */
    function setImgPos() {
        var info = getHorazontalInfo();
        var arr = new Array(info.imgNumEveeryRow).fill(0);

        imgDoms.forEach(dom => {
            var minTop = Math.min.apply(null, arr);
            var index = arr.indexOf(minTop);
            var left = index * (option.imgWidth + info.gap);
            dom.style.top = minTop + 'px';
            dom.style.left = left + 'px';

            // 计算下一个top的值并存储在arr中，以便下一张图片使用
            var nextTop = minTop + dom.clientHeight + info.gap;
            arr[index] = nextTop;
        });

        // 因为图片均为绝对定位，所以父级元素计算自动高度时，不会将其高夫计算在内
        // 因此为实现父级元素高度自适应，需进行进一步计算
        var maxTop = Math.max.apply(null, arr);
        option.container.style.height = maxTop - info.gap + 'px';
    }


}
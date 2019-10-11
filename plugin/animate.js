if (!this.myPlugin) {
    this.myPlugin = {};
}

this.myPlugin.Animate = function (option) {
    var defaultOption = {
        duration: 16,// 每次动画运行的间隔时间
        total: 1000, // 运动总时间
        begin: {},// 初始值
        end: {} // 终止值
    };
    this.option = Object.assign({}, defaultOption, option);
    // 得到运行的总次数
    this.totalTime = Math.ceil(this.option.total / this.option.duration);
    this.currentTime = 0; // 当前运动的次数
    // 获取运动的总距离，每次运行的距离
    this.distances = {};
    this.everyDistanceMove = {};
    for (var prop in this.option.begin) {
        this.distances[prop] = this.option.end[prop] - this.option.begin[prop];
        this.everyDistanceMove[prop] = this.distances[prop] / this.totalTime;
    }
    // 距离的中间变化状态
    this.moveData = myPlugin.clone(this.option.begin);
    // 设置计时器id
    this.timer = null;
}

this.myPlugin.Animate.prototype.start = function () {
    if (this.timer || this.currentTime === this.totalTime) { return; }

    // 运动开始事件
    typeof this.option.onstart === 'function' && this.option.onstart();
    var that = this;
    this.timer = setInterval(function () {
        that.currentTime++;

        for (var prop in that.option.begin) {
            // 由于js小数运算的不精确性，需要对终点数据进行进一步处理
            if (that.currentTime === that.totalTime) {
                that.moveData[prop] = that.option.end[prop];
            } else {
                that.moveData[prop] += that.everyDistanceMove[prop];
            }
        }
        // 运动过程事件
        typeof that.option.onmove === 'function' && that.option.onmove(that.moveData, that);

        if (that.currentTime === that.totalTime) {
            // 运动结束事件
            typeof that.option.onend === 'function' && that.option.onend();

            that.stop();
        }

    }, this.option.duration);
}

this.myPlugin.Animate.prototype.stop = function () {
    clearInterval(this.timer);
    this.timer = null;
}
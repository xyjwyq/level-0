!window.myPlugin && (window.myPlugin = {});

// 继承
window.myPlugin.inherit = (function () {
    var F = function () { };
    return function (origin, target) {
        F.prototype = target.prototype;
        origin.prototype = new F();
        origin.prototype.constructor = origin;
        origin.prototype.uber = target.prototype;
    }
})();

// 对象混入
window.myPlugin.mixin = function (obj1, obj2) {
    return Object.assign({}, obj1, obj2);

    // var res = {};
    // for (var prop in obj2) {
    //     res[prop] = obj2[prop]
    // }
    // for (var prop in obj1) {
    //     if (!(prop in res)) {
    //         res[prop] = obj1[prop];
    //     }
    // }
    // return res;
}

// 对象克隆
window.myPlugin.clone = function (target, deep) {
    if (Array.isArray(target)) {
        if (deep) {
            var newArr = [];
            for (var i = 0; i < target.length; i++) {
                newArr.push(this.clone(target[i], deep));
            }
            return newArr;
        } else {
            return target.slice();
        }
    } else if (typeof target === 'object') {
        var newObj = {};
        for (var prop in target) {
            if (deep) {
                newObj[prop] = this.clone(target[prop], deep)
            } else {
                newObj[prop] = target[prop];
            }
        }
        return newObj;
    } else {
        return target;
    }
}

// 函数防抖 —— 函数在动作结束后一段时间运行
window.myPlugin.debounce = function (callback, time) {
    var timer = null;
    return function () {
        clearTimeout(timer);
        var args = arguments;
        timer = setTimeout(function () {
            callback.apply(null, args);
        }, time);
    }
}

// 函数节流 ——— 一段时间内只运行一次
window.myPlugin.throttle = function (callback, duration, immediately) {
    // 方式1
    // var timer = null;
    // return function() {
    //     if (timer) {
    //         return;
    //     }
    //     var args = arguments;
    //     timer = setTimeout(function() {
    //         callback.apply(null, args);
    //         timer = null;
    //     }, duration);
    // }

    // 方式2
    // var time;
    // return function() {
    //     if (!time || (Date.now() - time) >= duration) {
    //         callback.apply(null, arguments);
    //         time = Date.now();
    //     }
    // }

    // 方式3
    // var time = 0;
    // return function () {
    //     var curTime = Date.now();
    //     if (curTime - time >= duration) {
    //         callback.apply(null, arguments);
    //         time = curTime;
    //     }
    // }

    // 方式4 
    if (immediately === undefined) {
        immediately = true;
    }
    if (immediately) {
        var time;
        return function () {
            if (!time || (Date.now() - time) >= duration) {
                callback.apply(null, arguments);
                time = Date.now();
            }
        }
    } else {
        var timer = null;
        return function () {
            if (timer) {
                return;
            }
            var args = arguments;
            timer = setTimeout(function () {
                callback.apply(null, args);
                timer = null;
            }, duration);
        }

    }

}
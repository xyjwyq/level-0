!this.myPlugin && (this.myPlugin = {});

// 继承
this.myPlugin.inherit = (function () {
    var F = function () { };
    return function (origin, target) {
        F.prototype = target.prototype;
        origin.prototype = new F();
        origin.prototype.constructor = origin;
        origin.prototype.uber = target.prototype;
    }
})();

// 对象混入
this.myPlugin.mixin = function (obj1, obj2) {
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
this.myPlugin.clone = function (target, deep) {
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
this.myPlugin.debounce = function (callback, time) {
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
this.myPlugin.throttle = function (callback, duration, immediately) {
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

/**
 * 科里化
 * 在函数式编程中，科里化最重要的作用是把多参函数变为单参函数
 */
this, myPlugin.curry = function (func) {
    var args = Array.prototype.slice.call(arguments, 1);
    var that = this;
    return function () {
        var curArgs = Array.from(arguments);
        var totalArgs = args.concat(curArgs);
        if (totalArgs.length < func.length) {
            totalArgs.unshift(func);
            return that.curry.apply(that, totalArgs);
        } else {
            return func.apply(null, totalArgs);
        }
    }
}

/**
 * 函数管道
 * 将多个单参函数组合起来，形成一个新的函数，这些函数中，前一个函数的输出，是后一个函数的输入
 * 所传入的函数都必须是单参函数
 */
this.myPlugin.pipe = function () {
    var args = Array.from(arguments);
    return function (val) {
        // 方式1
        // for (var i = 0; i < args.length; i++) {
        //     val = args[i](val)
        // }
        // return val;

        // 方式2
        return args.reduce(function (pre, cur) {
            return cur(pre);
        }, val);
    }
}
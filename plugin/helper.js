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
    // return Object.assign({}, obj1, obj2);

    var res = {};
    for (var prop in obj2) {
        res[prop] = obj2[prop]
    }
    for (var prop in obj1) {
        if (!(prop in res)) {
            res[prop] = obj1[prop];
        }
    }
    return res;
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
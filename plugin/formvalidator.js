if (!this.myPlugin) {
    this.myPlugin = {};
}

/**
 * 表单验证构造函数
 * 通过该构造函数创建一个表单验证对象
 */
this.myPlugin.FormValidator = function (option) {
    var defaultOption = {
        formDom: document.forms[0], // form元素
        formRule: {}, // 表单规则
        errorClass: 'field-error' // 错误类名
    }
    this.option = Object.assign({}, defaultOption, option); // 形成最终配置

    // 注册事件：得到所有字段容器 --> 找到需要的验证的dom --> 绑定事件
    var elements = this.getAllElements();
    var that = this;
    for (var i = 0; i < elements.length; i++) {
        var eleObj = elements[i];
        var field = eleObj.field;

        for (var j = 0; j < eleObj.doms.length; j++) {
            var el = eleObj.doms[j];
            var eventName = this.getEventName(el);
            var triggerFields = this.getTriggerFields(el);
            (function (field) {
                var fields = [field].concat(triggerFields);
                el.addEventListener(eventName, function () {
                    that.setStatus.apply(that, fields);
                });
            })(field);

        }
    }

}


// 获取表单数据
// 1. 先获取一个表单字段的数据
// 2. 获取整个表单的数据

/**
 * 根据表单字段名，获取一个表单字段的数据，若没有拿到任何数据，则返回null
 * @param {String} fieldName 表单字段名
 */
myPlugin.FormValidator.prototype.getFieldData = function (fieldName) {
    // 表单域容器 --> 需要验证的表单元素
    var container = this.getFieldContainer(fieldName);
    if (!container) {
        return;
    }
    var filedElements = this.getFieldElements(container);
    var data = []; // 用于存放获取的表单数据
    var fieldProp = myPlugin.FormValidator.dataConfig.fieldProp;
    var defaultFieldProp = myPlugin.FormValidator.dataConfig.fieldDefaultProp;
    filedElements.forEach(ele => {
        // 得到要验证的属性名 --> 根据属性名得到属性值
        var prop = ele.getAttribute(fieldProp);
        if (!prop) {
            prop = defaultFieldProp;
        }
        var value = ele[prop];
        // 单独处理checkbox与radio问题，因为他们可能是多选
        if (ele.type === 'checkbox' || ele.type === 'radio') {
            if (ele.checked) {
                data.push(value);
            }
        } else {
            data.push(value);

        }

    });
    if (data.length === 0) {
        return null;
    }
    if (filedElements.length === 1) {
        return data[0];
    }
    return data;
}

/**
 * 根据字段名，找到相应的表单域容器
 */
myPlugin.FormValidator.prototype.getFieldContainer = function (fieldName) {
    return document.querySelector(`[${myPlugin.FormValidator.dataConfig.fieldContainer}=${fieldName}]`);
}

myPlugin.FormValidator.prototype.getAllFieldContainer = function () {
    var containers = this.option.formDom.querySelectorAll(`[${myPlugin.FormValidator.dataConfig.fieldContainer}]`);
    return Array.from(containers);
}

/**
 * 得到一个表单容器中，所有需要验证的表单元素
 */
myPlugin.FormValidator.prototype.getFieldElements = function (container) {
    var filedElements = container.querySelectorAll(`[${myPlugin.FormValidator.dataConfig.field}]`);
    return Array.from(filedElements);
}

/**
 * 得到所有字段，对应的要验证的dom元素
 * 返回格式为 [{field:'loginId', doms:[...]}, ...]
 */
myPlugin.FormValidator.prototype.getAllElements = function () {
    var containers = this.getAllFieldContainer();
    var that = this;

    return containers.map(function (container) {
        return {
            field: container.getAttribute(`${myPlugin.FormValidator.dataConfig.fieldContainer}`),
            doms: that.getFieldElements(container)
        };
    });
}

/**
 * 得到整个表单的数据
 */
myPlugin.FormValidator.prototype.getFormData = function () {
    var fieldContainer = myPlugin.FormValidator.dataConfig.fieldContainer;
    var containers = this.getAllFieldContainer();
    var formData = {};
    Array.from(containers).forEach(container => {
        var fieldName = container.getAttribute(`${fieldContainer}`);
        var data = this.getFieldData(fieldName);
        formData[fieldName] = data;
    });
    return formData;
}

// 验证
// 1. 表单字段的值验证某一个规则
// 2. 验证一个表单字段的值
// 2. 验证整个表单的值

/**
 * 验证某一个表单字段中的某一个值
 */
myPlugin.FormValidator.prototype.validateData = function (data, ruleObj, formData) {
    // data的类型情况：null、string、array
    // ruleObj中rule的值类型：预设值、正则、函数
    var rule = ruleObj.rule;
    if (typeof rule === 'string') {
        // 检查预设值是否存在rule预设值，存在则验证，不存在则报错
        var func = myPlugin.FormValidator.validators[rule];
        if (!func) {
            throw new Error('预设值不存在');
        }
        if (func(data, formData)) {
            // 验证成功
            return true;
        }
        return ruleObj.message;

    } else if (rule instanceof RegExp) {
        return rule.test(data) ? true : ruleObj.message;
    } else if (typeof rule === 'function') {
        // 若验证规则是函数，则message属性无效
        return rule(data, formData);
    }
    throw new Error('验证规则不正确，请检查');
}

/**
 * 验证某个字段，返回一个验证结果，如果验证通过，返回true，如果验证没有通过，返回验证信息
 * 验证信息：字段名、数据、规则对象、错误消息
 */
myPlugin.FormValidator.prototype.validateField = function (fieldName, formData) {
    var data = formData[fieldName];
    var rules = this.option.formRule[fieldName];
    if (!rules) {
        return true;
    }

    for (var i = 0; i < rules.length; i++) {
        var ruleObj = rules[i];
        var res = this.validateData(data, ruleObj, formData);
        if (res !== true) {
            return {
                fieldName,
                data,
                ruleObj,
                message: res
            };
        }
    }
    return true;
}

/**
 * 验证表单
 * 无参，则验证真个表单
 * 有参，则验证对应的字段
 */
myPlugin.FormValidator.prototype.validate = function () {
    //  拿到所有字段，循环验证，返回信息
    var formData = this.getFormData();
    var that = this;
    if (arguments.length === 0) {
        var fields = Object.getOwnPropertyNames(formData);
    } else {
        var fields = Array.from(arguments);
    }

    return fields.map(function (field) {
        return that.validateField(field, formData);
    }).filter(function (res) {
        return res !== true;
    });
}

// 设置dom状态

/**
 * 设置每个字段的dom状态
 */
myPlugin.FormValidator.prototype.setFieldStatus = function (res, fieldName) {
    // 得到容器，在容器上添加错误类名
    // 得到显示错误信息的dom元素
    var fieldContainer = this.getFieldContainer(fieldName);
    // var fieldError = myPlugin.FormValidator.dataConfig.fieldError;
    // var fieldDefaultError = myPlugin.FormValidator.dataConfig.fieldDefaultError;
    var errorDom = fieldContainer.querySelector(`[${myPlugin.FormValidator.dataConfig.fieldError}]`);
    if (!errorDom) {
        errorDom = fieldContainer.querySelector(`${myPlugin.FormValidator.dataConfig.fieldDefaultError}`);
    }

    if (res) {
        // 验证结果存在错误
        if (errorDom) {
            errorDom.innerHTML = res.message;
        }
        fieldContainer.classList.add(this.option.errorClass);
    } else {
        fieldContainer.classList.remove(this.option.errorClass);
        if (errorDom) {
            errorDom.innerHTML = '';
        }
    }

}

/**
 * 设置整个表单的dom状态
 * 无参，设置整个表单
 * 有参，设置对应的字段
 */
myPlugin.FormValidator.prototype.setStatus = function () {

    if (arguments.length === 0) {
        var formData = this.getFormData();
        var fields = Object.getOwnPropertyNames(formData);
    } else {
        var fields = Array.from(arguments);
    }

    var results = this.validate.apply(this, fields);
    var that = this;
    fields.forEach(function (field) {
        var res = results.find(res => res.fieldName === field);
        that.setFieldStatus(res, field)
    });
}


// 注册事件

myPlugin.FormValidator.prototype.getEventName = function (ele) {
    var eventName = ele.getAttribute(`${myPlugin.FormValidator.dataConfig.fieldListener}`);
    if (!eventName) {
        eventName = myPlugin.FormValidator.dataConfig.fieldDefaultListener;
    }
    return eventName;
}

myPlugin.FormValidator.prototype.getTriggerFields = function (el) {
    var triggers = el.getAttribute(`${myPlugin.FormValidator.dataConfig.fieldTrigger}`);
    if (triggers) {
        return triggers.split(',');
    }
    return [];
}


/**
 * 为保证插件的灵活性、扩展性，需要在约定中的自定义属性名称进行统一配置
 */
myPlugin.FormValidator.dataConfig = {
    fieldContainer: 'data-field-container', // 表单字段容器
    field: 'data-field', // 需要验证的表单字段
    fieldProp: 'data-field-prop', // 需要验证的表单字段属性
    fieldDefaultProp: 'value', // 默认验证的表单字段属性
    fieldListener: 'data-field-listener', // 表单字段监听的事件
    fieldDefaultListener: 'change', // 表单字段的默认监听事件
    fieldTrigger: 'data-field-trigger', // 与表单相关联的验证，设置要验证的其他表单域，多个名称之间使用英文逗号分割，中间不能有空格
    fieldError: 'data-field-error', // 错误消息的元素
    fieldDefaultError: '.error' // 错误消息元素的默认类名
}

/**
 * 验证预设值的相关函数，统一处理，便于扩展和修改
 */
myPlugin.FormValidator.validators = {
    required(data) {
        if (!data) {
            return false;
        }
        if (Array.isArray(data) && data.length === 0) {
            return false;
        }
        return true;
    },
    mail(data) {
        if (!data) {
            return false;
        }
        var reg = /^\w+@\w+(\.\w+){1,2}$/;
        return reg.test(data);

    },
    number(data) {
        if (!data) {
            return false;
        }
        var reg = /^\d+(\.\d+)?$/;
        return reg.test(data);

    }
};
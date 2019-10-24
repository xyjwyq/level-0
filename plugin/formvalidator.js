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

/**
 * 得到一个表单容器中，所有需要验证的表单元素
 */
myPlugin.FormValidator.prototype.getFieldElements = function (container) {
    var filedElements = container.querySelectorAll(`[${myPlugin.FormValidator.dataConfig.field}]`);
    return Array.from(filedElements);
}

/**
 * 得到整个表单的数据
 */
myPlugin.FormValidator.prototype.getFormData = function () {
    var fieldContainer = myPlugin.FormValidator.dataConfig.fieldContainer;
    var containers = this.option.formDom.querySelectorAll(`[${fieldContainer}]`);
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
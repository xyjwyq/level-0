var lblScore = document.getElementById("integral");
var lblPrice = document.getElementById("total");
var table = document.getElementById("shopping");

table.onclick = function (e) {
    if (e.target.alt === 'add') {
        setInputValue(e.target.previousElementSibling, 1);
    } else if (e.target.alt === 'minus') {
        setInputValue(e.target.nextElementSibling, -1);
    } else if (e.target.type === 'checkbox') {
        if (e.target.id === "allCheckBox") {
            //全选
            var cbs = table.querySelectorAll("[name=cartCheckBox]");
            for (var i = 0; i < cbs.length; i++) {
                cbs[i].checked = e.target.checked;
            }
        }
        calTotal();
    } else if (e.target.parentElement.className === "cart_td_8") {
        deleteRow(e.target.parentElement.parentElement);
        calTotal();
    } else if (e.target.alt === "delete") {
        deleteChecked();
        calTotal();
    }
}

reCalTotal();

/**
 * 删除选中的行
 */
function deleteChecked() {
    var trs = document.querySelectorAll("tbody tr[id^=product]");
    var len = trs.length;
    for (var i = 0; i < len; i++) {
        var info = getRowInfo(trs[i]);
        if (info.checked) {
            deleteRow(trs[i]);
        }
    }
}

/**
 * 删除一行
 * @param {*} tr 
 */
function deleteRow(tr) {
    tr.previousElementSibling.remove();
    tr.remove();
}

/**
 * 计算增量
 * @param {*} inp 
 * @param {*} increase 
 */
function setInputValue(inp, increase) {
    var val = +inp.value + increase;
    if (val === 1) {
        val = 1;
    }
    inp.value = val;
    reCalTotal();

}

/**
 * 重新计算价格
 */
function reCalTotal() {
    calAllRowTotal();
    calTotal();
}

/**
 * 计算所有tr的总价
 */
function calAllRowTotal() {
    var trs = document.querySelectorAll('tbody tr[id^=product]');
    var len = trs.length;
    for (var i = 0; i < len; i++) {
        calRowTotal(trs[i]);
    }
}

/**
 * 计算所有商品的总价
 */
function calTotal() {
    var trs = document.querySelectorAll('tbody tr[id^=product]');
    var len = trs.length;
    var sum = 0;
    var score = 0; // 存储总积分
    for (var i = 0; i < len; i++) {
        var info = getRowInfo(trs[i]);
        if (info.checked) {
            sum += info.unitPrice * info.num;
            score += info.score * info.num;
        }
    }

    lblPrice.innerText = sum.toFixed(2);
    lblScore.innerText = score;
}


/**
 * 计算某一行的总价
 * @param {*} tr 
 */
function calRowTotal(tr) {
    var info = getRowInfo(tr);
    var total = info.unitPrice * info.num;
    tr.querySelector(".cart_td_7").innerText = total.toFixed(2);
}

/**
 * 得到某一行的所有信息
 * @param {*} tr 
 */
function getRowInfo(tr) {
    var unitPrice = +tr.querySelector(".cart_td_5").innerText;
    var num = +tr.querySelector(".cart_td_6 input").value;
    var score = +tr.querySelector(".cart_td_4").innerText;
    var checked = tr.querySelector(".cart_td_1 input").checked;
    var total = +tr.querySelector(".cart_td_7").innerText;

    return {
        unitPrice, //单价
        num, //数量
        score, //积分
        checked, //是否选中
        total //总价
    }
}
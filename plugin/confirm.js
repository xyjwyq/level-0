if (!window.myPlugin) {
    window.myPlugin = {};
}

window.myPlugin.openConfirm = (function () {

    var divModal = null,
        divWrapper = null,
        divHeader = null,
        divContent = null,
        divFooter = null,
        spanClose = null,
        btnConfirm = null,
        btnCancel = null,
        isBindEvent = false;
    defaultOption = {
        spanTitle: '提示',
        contentText: '确定吗？',
        confirmText: '确定',
        cancelText: '取消',
        onconfirm: function () { },
        oncancel: function () { }
    },
        option = [];

    function openConfirm(opt) {
        option = Object.assign(option, defaultOption, opt);
        init();
        bindEvent();
    }

    function init() {
        // 初始化蒙层
        initModal();
        // 初始化wrapper
        initDivWrapper();
        // 初始化配置
        initConfig();
    }

    /**
     * 初始化蒙层
     */
    function initModal() {
        if (!divModal) {
            divModal = document.createElement('div');
            divModal.style.position = 'fixed';
            divModal.style.top = divModal.style.left = 0;
            divModal.style.width = divModal.style.height = '100%';
            divModal.style.backgroundColor = 'rgba(0, 0, 0, .2)';
            document.body.appendChild(divModal);
        }
        divModal.style.display = 'block';
    }

    /**
     * 初始化插件wrapper
     */
    function initDivWrapper() {
        if (!divWrapper) {
            divWrapper = document.createElement('div');
            divWrapper.style.position = 'absolute';
            divWrapper.style.left = divWrapper.style.right = divWrapper.style.top = divWrapper.style.bottom = 0;
            divWrapper.style.margin = 'auto';
            divWrapper.style.width = '260px';
            divWrapper.style.height = '160px';
            divWrapper.style.backgroundColor = '#fff';
            divWrapper.style.fontSize = '14px';
            divWrapper.style.borderRadius = '5px 5px 0 0';
            divWrapper.style.overflow = 'hidden';
            // 初始化wrapper中子元素
            initDivCOntent();
            divModal.appendChild(divWrapper);
        }
    }

    /**
     * 初始化提示插件内部元素
     */
    function initDivCOntent() {
        // 初始化header
        divHeader = document.createElement('div');
        divHeader.style.height = '40px';
        divHeader.style.padding = '10px 20px 0';
        divHeader.style.boxSizing = 'border-box';
        divHeader.style.backgroundColor = '#eee';
        divHeader.innerHTML = `
            <span data-myplugin-id='title' style="float:left;">信息</span>
            <span data-myplugin-id='close' style="float:right;cursor:pointer;">
                <img style="width: 18px;height:18px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCklEQVRYR+2WPQ8BQRRFz/5IGgoaGgoaGgoaGgoaGgoa/qS8ZCd5JnY+NpJHslvuzNx37t2ZN1tg/BTG9WkAmgRSEmgBz5qbNbo2BiACD6AL3DMhOsANaIcMhABccVe3D1wTIXrARc2thIgl4Fw4rSFwjkAMgJOaE0wvBiA6vpsxcKyAGAEHNRZNLQVA9HxXU2DvQUyAnXqXklZWJ/TdzYFtWXAGbFTxUEpv3KkJuEW+y2U5sFKqn9Kp3Da5ACLku9XiOpWkA1MHQIQXgHYt7ySNdVJVNekvAUw/gekmND2Gpo3ItBWbXkY/cR2b/pC4fhX9rQp0v+jaup0wt+N+9TL6WnERahJoEngBVwxCId2AjWYAAAAASUVORK5CYII=" alt="关闭" />
            </span>
        `;
        divWrapper.appendChild(divHeader);

        // 初始化content元素
        divContent = document.createElement('div');
        divContent.dataset.mypluginId = 'content';
        divContent.style.height = '70px';
        divContent.style.padding = '20px';
        divContent.style.boxSizing = 'border-box';
        divContent.innerText = '确定删除？'
        divWrapper.appendChild(divContent);

        // 初始化footer
        divFooter = document.createElement('div');
        divFooter.style.height = '50px';
        divFooter.style.padding = '10px 20px';
        divFooter.style.textAlign = 'right';
        divFooter.innerHTML = `
            <button data-myplugin-id='confirm'>确定</button>
            <button data-myplugin-id='cancel'>取消</button>
        `;

        divWrapper.appendChild(divFooter);
    }

    /**
     * 初始化配置
     */
    function initConfig() {
        var spanTile = divHeader.querySelector('[data-myplugin-id=title]');
        spanClose = divHeader.querySelector('[data-myplugin-id=close]');
        btnConfirm = divFooter.querySelector('[data-myplugin-id=confirm]');
        btnCancel = divFooter.querySelector('[data-myplugin-id=cancel]');

        spanTile.innerText = option.spanTitle;
        divContent.innerText = option.contentText;
        btnConfirm.innerText = option.confirmText;
        btnConfirm.className = option.confirmClass || '';
        btnCancel.innerText = option.cancelText;
        btnCancel.className = option.cancelClass || '';
    }

    function bindEvent() {
        if (isBindEvent) return;
        bindEvent = true;
        spanClose.onclick = function () {
            close();
        };

        btnConfirm.onclick = function (e) {
            typeof option.onconfirm === 'function' && option.onconfirm();
            close();
        };

        btnCancel.onclick = function () {
            typeof option.oncancel === 'function' && option.oncancel();
            close();
        };

        divModal.onclick = function (e) {
            if (e.target === this) {
                close();
            }
        }

        function close() {
            divModal.style.display = 'none';
        }
    }

    return openConfirm;

})();
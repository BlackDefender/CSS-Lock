function cssLockInit() {

    var data;

    var dom = {
        minVal: document.getElementById('css-lock--min-val'),
        maxVal: document.getElementById('css-lock--max-val'),
        minWidth: document.getElementById('css-lock--min-width'),
        maxWidth: document.getElementById('css-lock--max-width'),
        output: document.getElementById('css-lock--output'),
        calculateBtn: document.getElementById('css-lock--calculate')
    };

    function getDefaultData() {
        return {
            dataStructureVersion: 2,
            outputType: 'less',
            minVal: 0,
            maxVal: 0,
            minWidth: 0,
            maxWidth: 0,
            output: ''
        };
    }

    (function load() {
        var dataStr = localStorage.getItem('cssLock');
        if(dataStr){
            try{
                data = JSON.parse(dataStr);
                if(!data.dataStructureVersion || data.dataStructureVersion !== getDefaultData().dataStructureVersion){
                    data = getDefaultData();
                }
            }
            catch (err){
                data = getDefaultData();
            }
        }else{
            data = getDefaultData();
        }
        document.getElementById('css-lock--output-type-'+data.outputType).checked = true;
        dom.minVal.value = data.minVal;
        dom.maxVal.value = data.maxVal;
        dom.minWidth.value = data.minWidth;
        dom.maxWidth.value = data.maxWidth;
        dom.output.textContent = data.output;
    })();

    function save() {
        localStorage.setItem('cssLock', JSON.stringify(data));
    }
    window.addEventListener('unload', save);

    function make() {
        data.outputType = document.querySelector('input[name="output-type"]:checked').value;
        data.minVal = dom.minVal.value;
        data.maxVal = dom.maxVal.value;
        data.minWidth = dom.minWidth.value;
        data.maxWidth = dom.maxWidth.value;
        data.output = '('+data.maxVal+'px + ('+data.maxVal+' - '+data.minVal+') * (100vw - '+data.maxWidth+'px) / ('+data.maxWidth+' - '+data.minWidth+'))';
        switch (data.outputType){
            case 'less':
                data.output = '~"calc' + data.output + '"';
                break;
            case 'scss':
                data.output = 'calc' + data.output;
                break;
        }
    }

    Array.prototype.forEach.call(document.querySelectorAll('.css-lock--input'), function (item) {
        item.addEventListener('input', function (e) {
            dom.calculateBtn.click();
            e.target.focus();
        });
        item.addEventListener('click', function () {
            this.select();
        });
        item.addEventListener('keydown', function (e) {
            var reCalculate = false;
            switch (e.keyCode){
                case 13: //press Enter
                    this.value = eval(this.value);
                    reCalculate = true;
                    break;
                case 38: // +1
                    this.value = parseInt(this.value)+1;
                    reCalculate = true;
                    break;
                case 40:
                    this.value = parseInt(this.value)-1;
                    reCalculate = true;
                    break;
            }
            if(reCalculate){
                e.preventDefault();
                dom.calculateBtn.click();
                e.target.focus();
                if (e.target.setSelectionRange) {
                    e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                }
            }
        });
    });
    Array.prototype.forEach.call(document.querySelectorAll('input[name="output-type"]'), function (item) {
        item.addEventListener('click', function () {
            dom.calculateBtn.click();
        });
    });

    new Clipboard('#css-lock--calculate', {
        text: function(trigger) {
            make();
            dom.output.textContent = data.output;
            return data.output;
        }
    });
}


document.addEventListener("DOMContentLoaded", function () {
    cssLockInit();
});

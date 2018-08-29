function cssLockInit() {

    const _parseInt = (val) => {
        val = parseInt(val);
        return isNaN(val) ? 0 : val;
    };

    const nl2br = (str) => {
        return str.replace(/([^>])\n/g, '$1<br/>');
    };

    const clearInput = (str) => {
        return str.split(' ')
                  .filter((item) => {return item !== '';})
                  .map((item)=>{return _parseInt(item);})
                  .join(' ');
    };

    const isMathExpression = (str) => {
        return ['+', '-', '*', '/'].some((sign) => {return str.includes(sign);});
    };

    const makeString = (fromVal, toVal, fromWidth, toWidth) => {
		if(fromVal === toVal){
		    return fromVal+((fromVal > 0) ? 'px' : '');
        }
        let result = '('+fromVal+'px + ('+fromVal+' - '+toVal+') * (100vw - '+fromWidth+'px) / ('+fromWidth+' - '+toWidth+'))';
        switch (data.outputType){
            case 'less':
                result = '~"calc' + result + '"';
                break;
            case 'scss':
                result = 'calc' + result;
                break;
        }
        return result;
    };

    let data;

    let dom = {
        minVal: document.getElementById('css-lock--min-val'),
        maxVal: document.getElementById('css-lock--max-val'),
        minWidth: document.getElementById('css-lock--min-width'),
        maxWidth: document.getElementById('css-lock--max-width'),
        output: document.getElementById('css-lock--output'),
        calculateBtn: document.getElementById('css-lock--calculate')
    };

    const getDefaultData = () => {
        return {
            dataStructureVersion: 2,
            outputType: 'less',
            minVal: 0,
            maxVal: 0,
            minWidth: 0,
            maxWidth: 0,
            output: ''
        };
    };

    // load
    (() => {
        let dataStr = localStorage.getItem('cssLock');
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
        dom.output.innerHTML = nl2br(data.output);
    })();

    // save
    window.addEventListener('unload', () => {
        localStorage.setItem('cssLock', JSON.stringify(data));
    });



    const make = () => {
        data.outputType = document.querySelector('input[name="output-type"]:checked').value;
        data.minVal = dom.minVal.value;
        data.maxVal = dom.maxVal.value;
        data.minWidth = dom.minWidth.value;
        data.maxWidth = dom.maxWidth.value;

        if(data.minVal === '' || data.maxVal === '') return;

        let fromVals = data.maxVal.split(' '),
            toVals = data.minVal.split(' ');

        data.output = '';
        for(let i=0; i<fromVals.length; ++i){
            if(toVals[i] !== undefined){
                if(i > 0) data.output += '\n';
                data.output += makeString(parseInt(fromVals[i]), parseInt(toVals[i]), data.maxWidth, data.minWidth);
            }
        }
    };

    Array.prototype.forEach.call(document.querySelectorAll('.css-lock--input'), (item) => {
        item.addEventListener('input', function (e) {
            if(!isMathExpression(this.value) && this.value[this.value.length - 1] !== ' '){
                this.value = clearInput(this.value);
                dom.calculateBtn.click();
                e.target.focus();
            }
        });
        item.addEventListener('click', function () {
            this.select();
        });
        item.addEventListener('keydown', function (e) {
            let reCalculate = false;
            switch (e.keyCode){
                case 13: //press Enter
                    this.value = eval(this.value);
                    reCalculate = true;
                    break;
                case 38: // arrow up
                    this.value = parseInt(this.value)+1;
                    reCalculate = true;
                    break;
                case 40:// arrow down
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
    Array.prototype.forEach.call(document.querySelectorAll('input[name="output-type"]'), (item) => {
        item.addEventListener('click', () => {
            dom.calculateBtn.click();
        });
    });

    new Clipboard('#css-lock--calculate', {
        text: () => {
            make();
            dom.output.innerHTML = nl2br(data.output);
            return data.output;
        }
    });
}


document.addEventListener("DOMContentLoaded", cssLockInit);

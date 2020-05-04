const copyToClipboard = (text) => {
    const element = document.createElement('textarea');
    element.style.position = 'fixed';
    element.style.top = '-100vh';
    document.body.appendChild(element);
    element.value = text;
    element.select();
    document.execCommand("copy");
    document.body.removeChild(element);
};

function cssLockInit() {

    const toIntOrZero = (val) => parseInt(val) || 0;

    const nl2br = str => str.replace(/([^>])\n/g, '$1<br/>');

    const clearInput = str => str.split(' ')
                                 .filter(item => item !== '')
                                 .map(item => item === 'auto' ? item : toIntOrZero(item))
                                 .join(' ');

    const isMathExpression = str => ['+', ' - ', '*', '/'].some(sign => str.includes(sign));

    const expressionIsFinished = str => '0123456789'.split('').includes(str[str.length - 1]);

    const makeString = (fromVal, toVal, fromWidth, toWidth) => {
		if (fromVal === toVal) {
		    return fromVal+((fromVal > 0) ? 'px' : '');
        }
        let result = `(${fromVal}px + (${fromVal} - ${toVal}) * (100${data.anchor} - ${fromWidth}px) / (${fromWidth} - ${toWidth}))`;
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
            dataStructureVersion: 3,
            outputType: 'scss',
            anchor: 'vw',
            minVal: 0,
            maxVal: 0,
            minWidth: 0,
            maxWidth: 0,
            output: ''
        };
    };

    // load
    (() => {
        data = getDefaultData();
        const dataStr = localStorage.getItem('cssLock');
        if (dataStr) {
            try {
                const dataLoaded = JSON.parse(dataStr);
                if (dataLoaded.dataStructureVersion && dataLoaded.dataStructureVersion === getDefaultData().dataStructureVersion) {
                    data = dataLoaded;
                }
            }
            catch (err) {}
        }
        document.getElementById('css-lock--output-type-'+data.outputType).checked = true;
        document.getElementById('css-lock--anchor-type-'+data.anchor).checked = true;
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
        data.anchor = document.querySelector('input[name="anchor-type"]:checked').value;
        data.minVal = dom.minVal.value;
        data.maxVal = dom.maxVal.value;
        data.minWidth = dom.minWidth.value;
        data.maxWidth = dom.maxWidth.value;

        if (data.minVal === '' || data.maxVal === '') return;

        let fromVals = data.maxVal.split(' '),
            toVals = data.minVal.split(' ');

        data.output = '';
        for (let i = 0; i < fromVals.length; ++i) {
            if (toVals[i] !== undefined) {
                if (i > 0) data.output += '\n';
                if (fromVals[i] === 'auto') {
                    data.output += 'auto';
                } else {
                    data.output += makeString(parseInt(fromVals[i]), parseInt(toVals[i]), data.maxWidth, data.minWidth);
                }
            }
        }
        dom.output.innerHTML = nl2br(data.output);
        copyToClipboard(data.output);
    };

    Array.prototype.forEach.call(document.querySelectorAll('.css-lock--input'), (item) => {
        item.addEventListener('input', function (e) {
            if (e.inputType === 'insertFromPaste') {
                e.target.value = clearInput(e.target.value);
                make();
                e.target.focus();
                if (e.target.setSelectionRange) {
                    e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                }
            } else {
                if (!isMathExpression(this.value) && expressionIsFinished(this.value)) {
                    this.value = clearInput(this.value);
                    make();
                    e.target.focus();
                }
            }
        });
        item.addEventListener('click', function () {
            this.select();
        });
        item.addEventListener('keydown', function (e) {
            let reCalculate = false;
            switch (e.code){
                case 'Enter':
                    this.value = eval(this.value);
                    reCalculate = true;
                    break;
                case 'ArrowUp':
                    this.value = parseInt(this.value)+1;
                    reCalculate = true;
                    break;
                case 'ArrowDown':
                    this.value = parseInt(this.value)-1;
                    reCalculate = true;
                    break;
            }
            if (reCalculate) {
                e.preventDefault();
                make();
                e.target.focus();
                if (e.target.setSelectionRange) {
                    e.target.setSelectionRange(e.target.value.length, e.target.value.length);
                }
            }
        });
    });
    [...document.querySelectorAll('input[name="output-type"], input[name="anchor-type"]')].forEach((item) => {
        item.addEventListener('click', () => make());
    });
}

const cssUnlockInit = () => {
    const input = document.getElementById('css-unlock-input');
    const unlock = () => {
        const point = document.querySelector('input[name="unlock-to-value"]:checked').value;
        const lockRegExp = /calc\(\-*\d+px \+ \((\-*\d+) - (\-*\d+)\) \* \(100vw \- \d+px\) \/ \(\d+ \- \d+\)\)/ig;
        const lockEquationRegExp = /calc\((\-*\d+)(px|%) (\+*\-*) \(\-*\d+px \+ \((\-*\d+) - (\-*\d+)\) \* \(100vw \- \d+px\) \/ \(\d+ \- \d+\)\)\)/ig;
        const multiStringParamRegExp = /:[^:;]+;/gm;
        let result = input.value.replace(lockRegExp, point === 'start' ? '$1px' : '$2px')
                                .replace(lockEquationRegExp, point === 'start' ? 'calc($1$2 $3 $4px)' : 'calc($1$2 $3 $5px)')
                                .replace(multiStringParamRegExp, item => item.replace(/\s+/g, ' '))
                                .replace(/~"/ig, '')
                                .replace(/"/ig, '')
                                .replace(/ 0px/ig, '0');
        input.value = result;
        copyToClipboard(result);
    };
    input.addEventListener('focus', () => {
        input.setSelectionRange(0, input.value.length);
    });
    input.addEventListener('input', unlock);
    unlock();
};

const hexToRgbConverterInit = () => {

    const hexToRgb = (hex) => {

        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    const outputElement = document.getElementById('hex-to-rgb-output');
    const inputElement = document.getElementById('hex-to-rgb-input');
    const opacityInputElement = document.getElementById('hex-to-rgb-opacity-input');
    const clearButton = document.getElementById('hex-to-rgb-clear-button');
    const convert = (e) => {
        const rgb = hexToRgb(inputElement.value);
        if(rgb){
            const opacity = opacityInputElement.value;
            const result = opacity !== '' ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            outputElement.textContent = result;
            copyToClipboard(result);
            e.target.focus();
        }
    };
    inputElement.addEventListener('input', convert);
    opacityInputElement.addEventListener('input', convert);
    clearButton.addEventListener('click', () => {
        inputElement.value = '';
        opacityInputElement.value = '';
    });
};

document.addEventListener("DOMContentLoaded", () => {
    cssLockInit();
    cssUnlockInit();
    hexToRgbConverterInit();
});



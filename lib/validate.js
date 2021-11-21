"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allStrings = void 0;
function allStrings(array) {
    return array.every((value) => typeof value === 'string');
}
exports.allStrings = allStrings;
function validate(config, labels) {
    let logs = '';
    let valid = true;
    function invalidate() {
        if (valid) {
            valid = false;
            logs += '\n\n';
        }
    }
    if (!config || config.constructor.name !== 'Object') {
        invalidate();
        logs += '\t❌ Configuration must be an object\n';
    }
    else {
        const keys = Object.keys(config);
        for (const [index, value] of Object.values(config).entries()) {
            if (Array.isArray(value)) {
                if (!allStrings(value)) {
                    invalidate();
                    logs += `\t❌ Array at "${keys[index]}" should contain strings only\n`;
                }
            }
            else if (typeof value !== 'string') {
                invalidate();
                logs += `\t❌ Value at "${keys[index]}" should be a string\n`;
            }
        }
        if (labels) {
            for (const key of keys) {
                if (!labels.find((label) => label.name === key)) {
                    invalidate();
                    logs += `\t❌ Couldn't find label "${key}"\n`;
                }
            }
        }
    }
    if (!valid) {
        console.log(logs);
    }
    return valid;
}
exports.default = validate;

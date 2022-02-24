"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valiturnCreateSessionParams = exports.validateCreateSessionParams = void 0;
function validateCheckUndefined(entries) {
    return entries.filter(([key, val]) => val === undefined)
        .map(([key, _val]) => new Error(`${key} undefined`));
}
function validateRequired(params) {
    const errors = Object.entries(params)
        .filter(([key, val]) => val === undefined)
        .map(([key, _val]) => `${key} undefined`);
    if (errors.length > 0) {
        return new Error(errors.join('\n'));
    }
    return params;
}
function validateCreateSessionParams(params) {
    let errors = [];
    errors = errors.concat(validateCheckUndefined(Object.entries(params)));
    return errors;
}
exports.validateCreateSessionParams = validateCreateSessionParams;
function valiturnCreateSessionParams(params) {
    const definedParams = validateRequired(params);
    if (definedParams instanceof Error) {
        return definedParams;
    }
    return definedParams;
}
exports.valiturnCreateSessionParams = valiturnCreateSessionParams;

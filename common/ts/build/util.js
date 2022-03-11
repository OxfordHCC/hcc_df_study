"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinErrors = exports.isError = exports.filterOf = exports.deepClone = void 0;
function deepClone(a) {
    return JSON.parse(JSON.stringify(a));
}
exports.deepClone = deepClone;
function filterOf(arr, constructor) {
    return arr.filter(x => x instanceof constructor);
}
exports.filterOf = filterOf;
function isError(x) {
    return x instanceof Error;
}
exports.isError = isError;
function joinErrors(errs) {
    return new Error(errs.filter(isError).map(err => err.message).join('\n'));
}
exports.joinErrors = joinErrors;

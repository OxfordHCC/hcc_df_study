"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterOf = exports.deepClone = void 0;
function deepClone(a) {
    return JSON.parse(JSON.stringify(a));
}
exports.deepClone = deepClone;
function filterOf(arr, constructor) {
    return arr.filter(x => x instanceof constructor);
}
exports.filterOf = filterOf;

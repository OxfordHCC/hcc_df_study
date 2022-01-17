"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepClone = void 0;
function deepClone(a) {
    return JSON.parse(JSON.stringify(a));
}
exports.deepClone = deepClone;

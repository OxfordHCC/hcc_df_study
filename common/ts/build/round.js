"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRoundData = void 0;
function isRoundName(x) {
    return x === "button"
        || x === "wire"
        || x === "keypad";
}
function isSolution(x) {
    return typeof x === "number"
        || Array.isArray(x) && x.every(xi => typeof xi === "number");
}
function isRoundData(x) {
    return isRoundName(x.name)
        && typeof x.msLength === "number"
        && isSolution(x.solution)
        && (x.answer === undefined || isSolution(x.answer))
        && (x.startTime === undefined || typeof x.startTime === "number")
        && (x.endTime === undefined || typeof x.endTime === "number");
}
exports.isRoundData = isRoundData;

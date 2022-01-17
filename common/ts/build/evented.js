"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evented = void 0;
// TODO: I'd like to make Evented accept type parameter of type that
// extends EventedCallbackMap so we can correctly type both event names
// and their associated callback:
//   e.g. something like <T extends EventedCallbackMap>.
class Evented {
    constructor() {
        this.cbMap = {};
    }
    off(event, cb) {
        const cbs = this.cbMap[event];
        if (cbs === undefined) {
            return;
        }
        const index = cbs.indexOf(cb);
        cbs.splice(index, 1);
    }
    on(event, cb) {
        if (this.cbMap[event] === undefined) {
            this.cbMap[event] = [];
        }
        const cbs = this.cbMap[event];
        cbs.push(cb);
    }
    trigger(event, ...args) {
        const cbs = this.cbMap[event];
        if (cbs === undefined) {
            return;
        }
        cbs.forEach(cb => cb.apply(null, args));
    }
}
exports.Evented = Evented;

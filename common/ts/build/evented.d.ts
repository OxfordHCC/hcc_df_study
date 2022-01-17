declare type EventedCallback = (...args: any[]) => void;
declare type EventedCallbackMap = {
    [key: string]: Array<EventedCallback>;
};
export declare class Evented<T extends string> {
    cbMap: EventedCallbackMap;
    constructor();
    off(event: T, cb: EventedCallback): void;
    on(event: T, cb: EventedCallback): void;
    trigger(event: T, ...args: any[]): void;
}
export {};

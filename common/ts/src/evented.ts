type EventedCallback = (...args: any[]) => void;
type EventedCallbackMap = {
	[key: string]:  Array<EventedCallback>
}

// TODO: I'd like to make Evented accept type parameter of type that
// extends EventedCallbackMap so we can correctly type both event names
// and their associated callback:
//   e.g. something like <T extends EventedCallbackMap>.
export class Evented<T extends string>{
	cbMap: EventedCallbackMap = {}

	constructor() { }

	off(event: T, cb: EventedCallback) {
		const cbs = this.cbMap[event];
		if (cbs === undefined) {
			return
		}
		const index = cbs.indexOf(cb);
		cbs.splice(index,1);
	}

	on(event: T, cb: EventedCallback) {
		if (this.cbMap[event] === undefined) {
			this.cbMap[event] = [];
		}
		const cbs = this.cbMap[event];
		cbs.push(cb);
	}

	trigger(event: T, ...args: any[]){
		const cbs = this.cbMap[event];
		if(cbs === undefined){
			return
		}
		cbs.forEach(cb => cb.apply(null, args));
	}
}

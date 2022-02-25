import { Evented } from 'dfs-common';

type GlobalErrEvents = "error";
class GlobalErr extends Evented<GlobalErrEvents> {
	constructor(){
		super()
	}
}

const globalErr = new GlobalErr();

export const onError = globalErr.on.bind(globalErr,"error");
export const offError = globalErr.off.bind(globalErr, "error");
export const showError = globalErr.trigger.bind(globalErr, "error");

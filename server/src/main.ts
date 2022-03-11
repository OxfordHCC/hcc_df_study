import { io } from "./socketio";
import { Logger } from './lib/log';
import { initSessions } from './lib/session';
import { isError } from 'dfs-common';

const { log,error } = Logger("main");

(async () => {
	const initResults = await initSessions();
	const errors = initResults.filter(isError);
	if(errors.length > 0){
		errors.forEach(err => error("init", err.message));
		return process.exit(1);
	}

	io.listen(3000);
	log("websockets-listening", "3000");
})()

import { io } from "./socketio";
import { Logger } from './lib/log';
import { initSessions } from './lib/session';

const { log,error } = Logger("main");

(async () => {
	// TODO: sync database, games, containers
	const synced = await initSessions();
	if(synced instanceof Error){
		error(synced.message);
		return process.exit(1);
	}

	io.listen(3000);
	log("websockets-listening", "3000");
})()

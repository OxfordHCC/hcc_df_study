import { resolve, fork, Future, debugMode } from 'fluture';

import { io } from "./socketio";
import { Logger } from './lib/log';
import { initSessions } from './lib/session';


const { log,error } = Logger("main");

// enable fluture's debug moge
debugMode(true);

;(() => {
	initSessions()
		.pipe(fork(err => {
			if (err instanceof Error) {
				return error(err.message);
			}
			return error("unknown error");
		})(_sessions => {
			io.listen(3000);
			log("websockets-listening", "3000")
		}))
})();


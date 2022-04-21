import { resolve, fork, Future, debugMode } from 'fluture';

import { io } from "./socketio";
import { Logger } from './lib/log';
import { initSessions } from './lib/session';


const { log,error } = Logger("main");

const WS_PORT = 8001;

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
			io.listen(WS_PORT);
			log("websockets-listening", WS_PORT)
		}))
})();


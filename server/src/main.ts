import { resolve, fork, Future, debugMode } from 'fluture';

import { io } from "./socketio";
import { Logger } from './lib/log';
import { chain } from 'Fluture';

import { initSessions } from './lib/session';
import { config } from './config';
import { startHTTPServer } from './http';

const { DFS_WS_PORT } = config;

const wsPort = parseInt(DFS_WS_PORT || "");
if (isNaN(wsPort)) {
	throw new Error("Missing/invalid DFS_WS_PORT env variable...");
}

const { log,error } = Logger("main");


// enable fluture's debug moge
debugMode(true);

;(() => {
	initSessions()
	.pipe(chain(startHTTPServer))
	.pipe(fork(err => {
		if (err instanceof Error) {
			return error(err.message);
		}
		return error("unknown error");
	})(_sessions => {
		io.listen(wsPort);
		log("websockets-listening", wsPort);
	}))
})();


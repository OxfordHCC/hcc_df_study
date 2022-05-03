import http from 'http';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { attempt, map } from 'Fluture';
import path from 'path';

import { config } from '../config';
import { Logger } from '../lib/log';

const { log, error } = Logger("http");
const { DFS_REC_DIR, DFS_HTTP_PASS, DFS_HTTP_PORT } = config;

if(!DFS_REC_DIR){
	throw new Error("Missing DFS_REC_DIR env var");
}

if(!DFS_HTTP_PASS){
	throw new Error("Missing DFS_HTTP_PASS env var");
}

if(!DFS_HTTP_PORT){
	throw new Error("Missing DFS_HTT_PORT env var");
}

const app = express();

app.use(basicAuth({
	users: { 'admin': DFS_HTTP_PASS },
	challenge: true
}));

app.use('/rec',express.static(path.resolve(__dirname, DFS_REC_DIR)));

export function startHTTPServer() {
	return attempt(() => app.listen(DFS_HTTP_PORT))
	.pipe(map(_ => log("HTTP server listening", DFS_HTTP_PORT!)));
}

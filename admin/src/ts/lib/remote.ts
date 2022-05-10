import { io, Socket } from "socket.io-client";
import { AdminClientNs } from 'dfs-common';
import { config } from './config';
import { showError } from './globalerr';

const { DFS_WS_PORT, DFS_WS_HOST } = config;

if(DFS_WS_PORT === undefined || DFS_WS_HOST === undefined){
	throw new Error("Invalid/missing env variables");
}

export const socket: Socket<AdminClientNs.ServerToClientEvents, AdminClientNs.ClientToServerEvents> = io(`ws://${DFS_WS_HOST}:${DFS_WS_PORT}/admin`);


export class ConnectionError extends Error{
	constructor(msg?: string){
		super(`Connection Error: ${msg}`);
		this.name="ConnectionError";
	}
}

socket.on('disconnect', () => {
	const err = new ConnectionError("disconnected");
	showError(err);
});

socket.on("connect_error", (e) => {
	const err = new ConnectionError(e.message);
	showError(err);
});

socket.on("error", (e) => {
	alert(e);
});


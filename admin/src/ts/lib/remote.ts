import { io, Socket } from "socket.io-client";
import { AdminClientNs } from 'dfs-common';
import { config } from './config';

const { DFS_WS_PORT, DFS_WS_HOST } = config;

if(DFS_WS_PORT === undefined || DFS_WS_HOST === undefined){
	throw new Error("Invalid/missing env variables");
}

export const socket: Socket<AdminClientNs.ServerToClientEvents, AdminClientNs.ClientToServerEvents> = io(`ws://${DFS_WS_HOST}:${DFS_WS_PORT}/admin`);


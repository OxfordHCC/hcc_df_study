import { Server, Namespace } from "socket.io";
import client from "./client";
import admin from "./admin";
import { config } from '../config';

const { DFS_WS_PATH } = config;

export const io = new Server({
	path: DFS_WS_PATH,
	cors: {
		origin: "*"
	}
});

registerNamespace("admin", admin);
registerNamespace("client", client);

type NamespaceInit = (ns: Namespace) => void;

function registerNamespace(name: string, init: NamespaceInit){
	const ns = io.of(name);
	init(ns);
}


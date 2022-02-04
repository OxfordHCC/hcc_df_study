import { Server, Namespace } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from 'dfs-common';
import client from "./client";
import admin from "./admin";

export const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>({
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


import { io, Socket } from "socket.io-client";
import { AdminClientNs } from 'dfs-common';

export const socket: Socket<AdminClientNs.ServerToClientEvents, AdminClientNs.ClientToServerEvents> = io("ws://localhost:3000/admin");


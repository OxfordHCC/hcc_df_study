import { io } from 'socket.io-client';
import { Evented, GameEvents, Answer } from "dfs-common";



export class SessionClient extends Evented<keyof ClientSessionEvents>{
}

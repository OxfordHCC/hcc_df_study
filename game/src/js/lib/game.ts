import { io } from "socket.io-client";
import { Evented, GameEvents, Answer } from "dfs-common";

// Note: DFS_WS_PATH is passed to the socket.io client constructor
// below and needs to match the value passed on the server side

const { DFS_WS_HOSTNAME, DFS_WS_PORT, DFS_WS_PATH, DFS_USE_TLS } = process.env;
const wsProtocol = DFS_USE_TLS === "1"? "wss" : "ws";


if(!DFS_WS_HOSTNAME || !DFS_WS_PORT){
	throw new Error("Missing env variables... ");
}

type ClientGameEvents = GameEvents & {
	"connect": () => void
	"disconnect": () => void
}

type GameParams = { playerId: string }
export class GameClient extends Evented<keyof ClientGameEvents>{
	playerId: string = "";
	socket;

	constructor({ playerId }: GameParams){
		super();
		this.playerId = playerId;
		this.socket = io(`${wsProtocol}://${DFS_WS_HOSTNAME}:${DFS_WS_PORT}/client`, {
			path: DFS_WS_PATH,
			autoConnect: false,
			query:{
				playerId: this.playerId
			}
		});
		
		this.socket.io.on("error", (error) => {
			this.trigger("error", error);
		});
		this.socket.on("connect", () => {
			this.trigger("connect");
		});
		this.socket.on("disconnect", () => {
			this.trigger("disconnect");
		});
		this.socket.on("state", (state) => {
			console.log(state);
			this.trigger("state", state);
		});
	}

	setReady(readyFlag: boolean){
		this.socket.emit("game:player_ready", readyFlag);
	}

	disconnect() {
		this.socket.disconnect();
	}

	connect(){
		this.socket.connect();
	}

	answer({ value, round }: Answer){
		this.socket.emit("game:answer", { value, round });
	}
}

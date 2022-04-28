import { io } from "socket.io-client";
import { Evented, GameEvents, Answer } from "dfs-common";

const { DFS_WS_HOSTNAME, DFS_WS_PORT, DFS_USE_TLS } = process.env;
const wsProtocol = DFS_USE_TLS? "wss" : "ws";

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
		this.socket = io(`${wsProtocol}://${DFS_WS_HOSTNAME}:${DFS_WS_PORT}/client`,{
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

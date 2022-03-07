import { io } from "socket.io-client";
import { Evented, GameEvents, Answer } from "dfs-common";

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
		this.socket = io("ws://localhost:3000/client",{
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

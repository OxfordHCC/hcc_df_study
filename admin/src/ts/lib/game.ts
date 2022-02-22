import { socket } from './remote';
import { GameData } from 'dfs-common';

type EventCb = (...args: any[]) => void;
const eventCbs = {};
let games: GameData[] = [];

const initted = new Promise((resolve, _reject) => {
	socket.on("init", (newGames) => {
		games = newGames;
		trigger("init", games);
		resolve(undefined);
	});
});

socket.io.on("error", (err) => {
	console.error("Error while connecting: ", JSON.stringify(err), err.message);
	trigger("error", err);
});

socket.on("state", (state: GameData) => {
	console.log("state called", state);
	const index = games.findIndex(g => g.gameId === state.gameId);
	if(index !== -1){
		games[index] = state;
	}else{
		games.push(state);
	}

	console.log("games is now", games);

	trigger("state", state)
	trigger("games", games);
});


export async function getGames(){
	await initted;
	return games;
}

function trigger(event: string, ...args: any){
	const cbs = eventCbs[event];
	if(cbs === undefined){
		return
	}
	cbs.forEach(cb => cb(...args));
}

export function onGame(event: string, cb: EventCb){
	if(eventCbs[event] === undefined){
		eventCbs[event] = [];
	}
	eventCbs[event].push(cb);
}

export function offGame(event: string, cb: EventCb){
	const cbs = eventCbs[event];
	if(cbs === undefined){
		return
	}

	const cbIndex = cbs.findIndex((x: EventCb) => x === cb);
	cbs.splice(cbIndex, 1);
}

export function onceGame(event: string,cb: EventCb){
	const cbWrap = (...args) => {
		cb(...args);
		offGame(event, cb);
	}
	onGame(event, cbWrap);
}

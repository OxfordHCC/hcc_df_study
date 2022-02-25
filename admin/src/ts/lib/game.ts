import { socket } from './remote';
import { GameData } from 'dfs-common';


let games: GameData[] = [];
const initted = new Promise((resolve, _reject) => {
	socket.on("init", (newGames) => {
		games = newGames;
		resolve(undefined);
	});
});

socket.io.on("error", (err) => {
	console.error("Error while connecting: ", JSON.stringify(err), err.message);
});

socket.on("state", (state: GameData) => {
	console.log("state called", state);
	const index = games.findIndex(g => g.gameId === state.gameId);
	if(index !== -1){
		games[index] = state;
	}else{
		games.push(state);
	}

	console.log("state called", games);
});


export async function getGames(){
	await initted;
	return games;
}

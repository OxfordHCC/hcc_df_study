import { Namespace } from "socket.io";
import crypto from 'crypto';
import { RoundData } from 'dfs-common';

import { createRound } from "../lib/round/";
import { Logger } from '../lib/log';
import { Game, getGames, createGame } from '../lib/game';


const { log } = Logger("socket.io/admin");

export default function(admin: Namespace) {
	admin.on("connection", (socket) => {
		const games = getGames();

		socket.emit("init", games.map(game => game.state()));

		games.forEach((game: Game) => {
			game.on("state", () => {
				socket.emit("state", game.state())
			});
		});

		socket.on("create_game", ({ blue, red, roundsData }, cb) => {
			if(!blue || !red || !rounds){
				cb("Invalid arguments in create_game event");
				return;
			}

			const rounds = roundsData.map(createRound);
			const id = crypto.randomUUID();
			
			const game = createGame({
				gameId: id,
				players: [blue, red],
				rounds
			});

			log("create_game", blue, red, id);
			
			cb(null, game.state());
			socket.emit("state", game.state());
		});
	});

}

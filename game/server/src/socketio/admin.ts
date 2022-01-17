import { Namespace } from "socket.io";
import { GameState } from "dfs-common";
import { Logger } from '../lib/log';

import { Game, getGames, createGame } from '../lib/game';

const { log, error } = Logger("socket.io/client");

export default function(admin: Namespace) {
	admin.on("connection", (socket) => {
		const games = getGames();

		socket.emit("init", games.map(game => game.state));

		games.forEach((game: Game) => {
			game.on("state", () => {
				socket.emit("state", game.state);
			});
		});

		socket.on("create_game", ({ id, blue, red }, cb) => {
			if(!id || !blue || !red){
				cb("Invalid arguments in create_game event");
				return;
			}
			
			const game = createGame({
				gameId: id,
				players: [blue, red],
				msRoundLength: 10
			});
			
			cb(undefined, game.state);
			socket.emit("state", game.state);
		});
	});

}

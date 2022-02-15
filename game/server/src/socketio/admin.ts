import { Namespace } from "socket.io";
import crypto from 'crypto';
import { AdminClientNs, Player } from 'dfs-common';

import { createRound, isRound } from "../lib/round/";
import { Logger } from '../lib/log';
import { Game, getGames } from '../lib/game';
import { createPlayer } from '../lib/player';

const { log } = Logger("socket.io/admin");


type AdminNamespace = Namespace<AdminClientNs.ClientToServerEvents, AdminClientNs.ServerToClientEvents, AdminClientNs.InterServerEvents, AdminClientNs.SocketData>;

export default function(admin: AdminNamespace) {
	admin.on("connection", (socket) => {
		const games = getGames();

		socket.emit("init", games.map(game => game.state()));

		games.forEach((game: Game) => {
			game.on("state", () => {
				socket.emit("state", game.state())
			});
		});

		socket.on("create_game", ({ blue, red, roundsData }, cb) => {
			if (!blue || !red || !roundsData) {
				cb(new Error("Invalid arguments in create_game event"), null);
				return;
			}

			const roundResults = roundsData.map(createRound);
			const roundErrors = roundResults.filter(r => r instanceof Error);
			const rounds = roundResults.filter(isRound);

			if (roundErrors.length !== 0) {
				socket.emit("error", roundErrors.join(";\n"));
				return;
			}
						
			const players = [blue, red].map(createPlayer);
			
			const gameId = crypto.randomUUID();
			const game = new Game({
				gameId,
				players,
				rounds
			});

			log("create_game", blue, red, gameId);

			cb(null, game.state());
			socket.emit("state", game.state());
		});
	});
}

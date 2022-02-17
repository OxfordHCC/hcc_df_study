import { Namespace } from "socket.io";
import { AdminClientNs, Player } from 'dfs-common';

import { createSession } from '../lib/session';
import { Logger } from '../lib/log';
import { Game, getGames } from '../lib/game';

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


		socket.on("create_session", ({ blue, red  }, cb) => {
			log("create_session",blue,red);
			if (!blue || !red) {
				cb(new Error("Invalid arguments in create_game event"), null);
				return;
			}
						
			const session = createSession(blue, red);
			cb(null, session);
		});
	});
}

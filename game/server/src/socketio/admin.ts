import { Namespace } from "socket.io";
import { AdminClientNs } from 'dfs-common';
import { createSession, getSessions } from '../lib/session';
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

		socket.on("create_session", async ({ blue, red, murmurPort, grpcPort }, cb) => {
			log("create_session",blue,red);
			if (!blue || !red) {
				cb(new Error("Invalid arguments in create_game event"), null);
				return;
			}

			const session = await createSession(blue, red, grpcPort, murmurPort);
			if(session instanceof Error){
				cb(session, null);
				return;
			}
			
			cb(null, session);
		});

		socket.on("get_sessions", async (cb) => {
			const sessions = await getSessions();
			if(sessions instanceof Error){
				cb(sessions, null);
				return;
			}
			
			cb(null, sessions);
		});
	});
}

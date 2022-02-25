import { Namespace } from "socket.io";
import { validateCreateSessionParams, AdminClientNs } from 'dfs-common';
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

		socket.on("create_session", async (params, cb) => {
			const validationErrors = validateCreateSessionParams(params);
			if(validationErrors.length > 0) {
				cb(new Error("Invalid arguments in create_session event"));
				return;
			}

			const { blueParticipant, redParticipant } = params;
			
			log("create_session", blueParticipant, redParticipant);

			const session = await createSession(params);
			if(session instanceof Error){
				cb(session);
				return;
			}
			
			cb(undefined, session);
		});

		socket.on("get_sessions", async (cb) => {
			const sessions = await getSessions();
			if(sessions instanceof Error){
				cb(sessions);
				return;
			}
			
			cb(undefined, sessions);
		});
	});
}

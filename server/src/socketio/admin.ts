import { Namespace } from "socket.io";
import { Either, Left, Right } from 'monet';
import { chain, fork, map } from 'fluture';
import { AdminClientNs, joinErrors } from 'dfs-common';
import { createSession, removeSession, getSessions } from '../lib/session';
import { Logger } from '../lib/log';
import { Game, getGames } from '../lib/game';
import { e2f, find } from '../lib/util';
import { getRecordings, getMurmurBySessionId } from '../lib/murmurlib';


const { log } = Logger("socket.io/admin");

type AdminNamespace = Namespace<AdminClientNs.ClientToServerEvents, AdminClientNs.ServerToClientEvents, AdminClientNs.InterServerEvents, AdminClientNs.SocketData>;

class UnknownError extends Error{
	constructor(){
		super();
		this.name = "UnknownError";
	}
}

function validateCheckUndefined(entries: Array<[string, any]>){
	return entries.filter(([_key, val]) => val === undefined)
	.map(([key, _val]) => new Error(`${key} undefined`));
}


export function validateCreateSessionParams(
	params: AdminClientNs.CreateSessionParams
): Either<Error, AdminClientNs.CreateSessionParams> {
	let errors: Array<Error> = [];
	errors = errors.concat(validateCheckUndefined(
			Object.entries(params)));
	
	if(errors.length > 0){
		return Left(joinErrors(errors));
	}
	
	return Right(params);
}

export default function(admin: AdminNamespace) {
	admin.on("connection", (socket) => {
		const games = getGames();

		socket.emit("init", games.map(game => game.state()));

		games.forEach((game: Game) => {
			game.on("state", () => {
				socket.emit("state", game.state())
			});
		});

		socket.on("create_session", (params, cb) => {
			return e2f(validateCreateSessionParams(params))
			.pipe(chain(params => {
				const { blueParticipant, redParticipant } = params;
				log("create_session", blueParticipant, redParticipant);
				return createSession(params)
			}))
			.pipe(fork(x => {
				if(x instanceof Error){
					return cb(x);
				}
				return cb(new UnknownError());
			})(x => {
				return cb(undefined, x);
			}))
		});

		socket.on("get_recordings", (params, cb) => {
			const { sessionId } = params;
			return getMurmurBySessionId(sessionId)
			.pipe(chain(getRecordings))
			.pipe(fork(err => {
				if(err instanceof Error){
					return cb(err);
				}
				return cb(new UnknownError());
			})(recordings => {
				return cb(undefined, recordings);
			}));
		});
		
		socket.on("get_sessions", (cb) =>
			getSessions()
				.pipe(fork(err => {
					if (err instanceof Error) {
						return cb(err);
					}
					return cb(new UnknownError());
				})(x => cb(undefined, x))));

		socket.on("remove_session", (params, cb) => {
			const { sessionId } = params;
			return removeSession({ sessionId })
			.pipe(fork(err => {
				if (err instanceof Error) {
					return cb(err);
				}
				return cb(new UnknownError());
			})(x => cb()))
		});
	});
}


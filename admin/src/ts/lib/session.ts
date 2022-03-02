import { Either, Session, AdminClientNs } from 'dfs-common';
import { socket } from './remote';

export function getSessions(): Promise<Either<Error, Session[]>>{
	return new Promise((resolve, _reject) => {
		socket.emit("get_sessions", (err, sessions) => {
			if (err) {
				return resolve(err);
			}
			if(sessions === undefined){
				return resolve(new Error("get_sessions call returned undefined. Server error."))
			}
			return resolve(sessions);
		});
	});
}

export function createSession(
	params: AdminClientNs.CreateSessionParams
): Promise<Either<Error, Session>>{
	return new Promise((resolve, _reject) => {
		socket.emit("create_session", params, (err, session) => {
			if(err){
				return resolve(err);
			}

			if(session === undefined){
				return resolve(new Error("create_session call returned undefined. Server Error."));
			}

			resolve(session);
		});
	});
}

export function deleteSession(sessionId: number){
	
}

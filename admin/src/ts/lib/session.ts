import { Either, Session, AdminClientNs } from 'dfs-common';
import { socket } from './remote';

export function getSessions(): Promise<Either<Error, Session[]>>{
	return new Promise((resolve, _reject) => {
		socket.emit("get_sessions", (err, sessions) => {
			if (err) {
				return resolve(err);
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
			if (err){
				resolve(err);
				return;
			}
			resolve(session);
		});
	});
}

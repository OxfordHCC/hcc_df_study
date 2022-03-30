import { Session, AdminClientNs } from 'dfs-common';
import { socket } from './remote';

export function getSessions(): Promise<Session[]>{
	return new Promise((resolve, reject) => {
		socket.emit("get_sessions", (err, sessions) => {
			if (err) {
				return reject(err);
			}
			if(sessions === undefined){
				return reject(new Error("get_sessions call returned undefined. Server error."))
			}
			return resolve(sessions);
		});
	});
}

export function createSession(
	params: AdminClientNs.CreateSessionParams
): Promise<Session>{
	return new Promise((resolve, reject) => {
		socket.emit("create_session", params, (err, session) => {
			if(err){
				return reject(err);
			}

			if(session === undefined){
				return reject(new Error("create_session call returned undefined. Server Error."));
			}

			resolve(session);
		});
	});
}

export function deleteSession(sessionId: number){
	
}

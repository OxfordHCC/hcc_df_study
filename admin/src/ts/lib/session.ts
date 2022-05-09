import { Session, AdminClientNs } from 'dfs-common';
import { RecFile } from 'dfs-common';
import { socket } from './remote';

export function getSessions(): Promise<Session[]> {
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
	return new Promise((resolve, reject) => {
		socket.emit("remove_session", { sessionId }, (err) => {
			if(err){
				return reject(err);
			}
			return resolve(null);
		});
	});
}

export async function getSessionData(sessionId: number): Promise<Session | undefined> {
	const sessions = await getSessions();
	const res = sessions.find(sess => sess.sessionId === sessionId);
	return res;
}3

export function getSessionRecordings(sessionId: number): Promise<RecFile[]>{
	return new Promise((res, rej) => {
		socket.emit("get_recordings", { sessionId }, (err, recordings) => {
			if(err !== null){
				return rej(err);
			}
			if(recordings === undefined){
				return rej(new Error("Undefined error while getting session recordings."));
			}
			
			return res(recordings);
		});
	});
}

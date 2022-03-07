import { Either, Session, AdminClientNs } from 'dfs-common';
import { createMurmurContainer } from './murmurlib';
import { DockerError, start, rm } from './dockerlib';
import { removeGame, createGame } from './game';
import { Logger } from './log';
import { withDb } from './db';

const { log, error } = Logger("session");


const insertSessionSQL = `
INSERT INTO study_session
(game_id, murmur_id, blue_participant, red_participant, murmur_port, grpc_port) 
VALUES ($game_id, $murmur_id, $blue, $red, $murmur, $grpc);
`;
type InsertSessionParam = Omit<Session, "sessionId">;
type InsertSessionResult = { sessionId: number } 
function insertSession(session: InsertSessionParam) {
	return withDb<InsertSessionResult>((db) =>
		new Promise((resolve, reject) => {
			db.run(insertSessionSQL, {
				$game_id: session.gameId,
				$murmur_id: session.murmurId,
				$blue: session.blueParticipant,
				$red: session.redParticipant,
				$murmur: session.murmurPort,
				$grpc: session.grpcPort
			}, function(err) {
				if (err) {
					return reject(err);
				}

				const sessionId = this.lastID;
				resolve({ sessionId });
			});
		})
	);
}

function normalizeDbSession(db_session: any): Session{
	return {
		sessionId: db_session.session_id,
		gameId: db_session.game_id,
		blueParticipant: db_session.blue_participant,
		redParticipant: db_session.red_participant,
		murmurId: db_session.murmur_id,
		murmurPort: db_session.murmur_port,
		grpcPort: db_session.grpc_port
	};
}

const selectSessionsSQL = `
SELECT * FROM study_session;
`;
export async function getSessions(){
	return withDb<Session[]>(db =>
		new Promise((resolve, reject) => {
			db.all(selectSessionsSQL, (err, rows) => {
				if(err){
					return reject(err);
				}
				resolve(rows.map(normalizeDbSession) as Session[]);
			})
		})
	)
}

export async function createSession(
	{ blueParticipant, redParticipant, murmurPort, grpcPort }: AdminClientNs.CreateSessionParams
): Promise<Either<Error, Session>> {
	const game = createGame(blueParticipant, redParticipant);
	const murmur = await createMurmurContainer({
		murmurPort,
		grpcPort
	});

	if (game instanceof Error) {
		return game;
	}
	
	if(murmur instanceof Error){
		removeGame(game);
		return murmur;
	}

	const startRes = await start(murmur.Id);

	if (startRes instanceof Error) {
		await rm(murmur.Id);
		removeGame(game);
		return startRes;
	}
		
	const session = {
		gameId: game.gameId,
		murmurId: murmur.Id,
		blueParticipant,
		redParticipant,
		murmurPort,
		grpcPort
	};

	const insertRes = await insertSession(session);
	if(insertRes instanceof Error){
		return insertRes;
	}

	const { sessionId } = insertRes;

	return {
		...session,
		sessionId
	}
}

async function initSession(session: Session): Promise<Either<Error, Session>>{
	// create game
	const game = createGame(session.blueParticipant, session.redParticipant);
	if(game instanceof Error){
		return game;
	}

	// start murmur container
	const res = await start(session.murmurId);
	if(res instanceof DockerError){
		if(res.statusCode === 404){
			// create if does not exist
			const murmur = await createMurmurContainer({
				name: session.murmurId,
				murmurPort: session.murmurPort,
				grpcPort: session.grpcPort
			});
			
			if(murmur instanceof Error){
				return murmur;
			}
		}
		if(res.statusCode === 409){
			error("container already exists");
		}
	}

	return session;
}

function isError(x: any): x is Error{
	return x instanceof Error;
}
export async function init(): Promise<Error[]>{
	const sessions = await getSessions();
	if(sessions instanceof Error){
		return [sessions];
	}
	
	const initted = await Promise.all(sessions.map(initSession));
	const errors = initted.filter(isError);

	return errors;
}

export async function initSessions(){
	const sessions = await getSessions();
	if(sessions instanceof Error){
		return sessions;
	}
	
	log("sync", "sessions length", sessions.length);

	sessions.map(sesh => initSession(sesh));
}



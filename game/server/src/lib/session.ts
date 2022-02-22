import { Either, Session, AdminClientNs } from 'dfs-common';
import { createMurmurContainer } from './murmurlib';
import { DockerError, start } from './dockerlib';
import { createGame } from './game';
import { withDb } from './db';


const insertSessionSQL = `
INSERT INTO study_session
(game_id, murmur_id, blue_participant, red_participant) 
VALUES ($game_id, $murmur_id, $blue, $red);
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
				$red: session.redParticipant
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
				resolve(rows as Session[]);
			})
		})
	)
}

export async function createSession(
	{ blueParticipant, redParticipant, murmurPort, grpcPort }: AdminClientNs.CreateSessionParams
): Promise<Either<Error, Session>> {
	const game = createGame(blueParticipant, redParticipant);

	if (game instanceof Error) {
		return game;
	}
	
	const murmur = await createMurmurContainer({
		murmurPort,
		grpcPort
	});
	
	if(murmur instanceof Error){
		return murmur;
	}
	
	await start(murmur.Id);
		
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
	const res = start(session.murmurId);
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




import { createMurmurContainer } from './murmurlib';
import { DockerError, start } from './dockerlib';
import { Logger } from './log';
import { createGame, saveGame } from './game';
import { withDb } from './db';
import { Either } from './fp';

const { log, error } = Logger("sessions");

type Session = {
	sessionId: number;
	gameId: string;
	murmurId: string;
	blueParticipant: string;
	redParticipant: string;
	murmurPort: number;
	grpcPort: number;
};

const insertSessionSQL = `
INSERT INTO study_session
(game_id, murmur_id, blue_participant, red_participant) 
VALUES ($game_id, $murmur_id, $blue, $red);
`;
type InsertSessionParam = Omit<Session, "sessionId">;
function insertSession(session: InsertSessionParam) {
	return withDb((db) =>
		new Promise((resolve, reject) => {
			db.run(insertSessionSQL, {
				$game_id: session.gameId,
				$murmur_id: session.murmurId,
				$blue: session.blueParticipant,
				$red: session.redParticipant
			}, (err) => {
				if (err) {
					return reject(err);
				}
				resolve(0);
			});
		})
	);
}

const selectSessionsSQL = `
SELECT * FROM study_session;
`;
export async function getSessions(): Promise<Session[]>{
	return withDb(db =>
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
	blueParticipant: string, redParticipant: string,
	grpcPort: number, murmurPort: number
): Promise<Either<Error, void>>{
	const game = createGame(blueParticipant, redParticipant);
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

	insertSession(session);
}

async function initSession(session: Session): Promise<Either<Error, any>>{
	// create game
	const game = createGame(session.blueParticipant, session.redParticipant);
	saveGame(game);

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

export async function init(): Promise<Error[]>{
	const sessions = await getSessions();
	const initted = await Promise.all(sessions.map(initSession));
	const errors = initted.filter(i => i instanceof Error);

	return errors;
}




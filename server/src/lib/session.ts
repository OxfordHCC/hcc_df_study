import { isError, joinErrors, isGameData, Either, Session, AdminClientNs } from 'dfs-common';
import { createMurmurContainer, initMurmurContainer } from './murmurlib';
import {
	Game,
	getGame,
	createGame,
	gameSchedules,
	initGame,
	getSessionGames
} from './game';
import { Logger } from './log';
import { withDb } from './db';

const { log, error } = Logger("session");

export async function getPlayerSession(playerId: string){
	const sessions = await getSessions();
	if(sessions instanceof Error){
		return sessions;
	}

	const playerSession = sessions.find(sess => {
		return sess.blueParticipant === playerId
			|| sess.redParticipant === playerId;
	});

	return playerSession
		|| new Error("Player session not found.");
}

const insertSessionSQL = `
INSERT INTO study_session
(murmur_id, blue_participant, red_participant, murmur_port, grpc_port) 
VALUES ($murmur_id, $blue, $red, $murmur, $grpc);
`;
type InsertSessionParam = Omit<Session, "sessionId">;
type InsertSessionResult = { sessionId: number } 
function insertSession(session: InsertSessionParam) {
	return withDb<InsertSessionResult>((db) =>
		new Promise((resolve, reject) => {
			db.run(insertSessionSQL, {
				$murmur_id: session.murmurId,
				$blue: session.blueParticipant,
				$red: session.redParticipant,
				$murmur: session.murmurPort,
				$grpc: session.grpcPort,
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
		blueParticipant: db_session.blue_participant,
		redParticipant: db_session.red_participant,
		murmurId: db_session.murmur_id,
		murmurPort: db_session.murmur_port,
		grpcPort: db_session.grpc_port,
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
): Promise<Either<Error, Session>>{
	log("createSession", blueParticipant, redParticipant, murmurPort, grpcPort);
	const murmur = await createMurmurContainer({
		murmurPort,
		grpcPort
	});

	if (murmur instanceof Error) {
		return murmur;
	}

	// save session
	const session = {
		murmurId: murmur.id,
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

	const createGameResults = await Promise.all([
		createGame(blueParticipant, redParticipant, sessionId, gameSchedules[0], true),
		createGame(redParticipant, blueParticipant, sessionId, gameSchedules[1], false)
 	]);
	
	const createGameErrors = createGameResults.filter(isError);
	const gamesData = createGameResults.filter(isGameData);
	
	if(createGameErrors.length > 0){
	 	return joinErrors(createGameErrors);
	}

	const games = gamesData.map(initGame);

	return {
		...session,
		sessionId
	}
}

function setCurrentGame(sessionId: number, gameId: string) {
	log("set current game", sessionId, gameId);
	return withDb(db => {
		db.run("BEGIN TRANSACTION");
		db.run("UPDATE game SET is_current = 0 WHERE session_id = $session_id", {
			$session_id: sessionId
		});
		db.run("UPDATE game SET is_current = 1 WHERE game_id = $game_id", {
			$game_id: gameId
		});
		db.run("COMMIT");
	});
}

async function initSession(session: Session): Promise<Either<Error, Session>>{
	log("init session", session.sessionId);
	// init games
	const gameRows = await getSessionGames(session.sessionId);
	if(gameRows instanceof Error){
		return gameRows; 
	}
	
	const sessionGamesData = gameRows.map(row => row.gameData)
	const games = sessionGamesData.map(initGame);
	
	// init murmur container
	const murmur = await initMurmurContainer(session);
	if(murmur instanceof Error){
		return murmur;
	}
	
	return session;
}

// init sessions:
// - start murmur containers;
// - create in-memory game-handling objects
export async function initSessions(): Promise<Array<Error | Session>> {
	log("init start");
	const sessions = await getSessions();
	if (sessions instanceof Error) {
		return [sessions];
	}
	
	const initResults = await Promise.all(sessions.map(initSession));
	const initErrors = initResults.filter(isError);

	if (initErrors.length > 0) {
		return initErrors;
	}
	
	log("init OK");
	return sessions;
}

export async function getCurrentGame(
	sessionId: number
): Promise<Either<Error, Game>>{
	const gameRows = await getSessionGames(sessionId);
	if(gameRows instanceof Error){
		return gameRows;
	}

	const currentGame = gameRows.find(game => game.isCurrent === true);
	if(currentGame === undefined){
		return new Error("Current game not found for session");
	}
	
	return getGame(currentGame.gameId);
}


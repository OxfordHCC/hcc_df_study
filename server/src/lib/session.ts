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
import { createAttack, getAttacks, scheduleAttack } from './attacklib';

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
	);
}

export async function createSession(
	{ blueParticipant, redParticipant, murmurPort, grpcPort }: AdminClientNs.CreateSessionParams
): Promise<Either<Error, Session>>{
	log("create_session", blueParticipant, redParticipant, murmurPort, grpcPort);
	// create murmur container
	const murmur = await createMurmurContainer({
		murmurPort,
		grpcPort
	});

	if (murmur instanceof Error) {
		error("create_session", "create_murmur", grpcPort, murmurPort, murmur.message);
		return murmur;
	}

	// insert session in database
	const sessionPartial = {
		murmurId: murmur.id,
		blueParticipant,
		redParticipant,
		murmurPort,
		grpcPort
	};

	const insertRes = await insertSession(sessionPartial);
	if(insertRes instanceof Error){
		return insertRes;
	}

	const { sessionId } = insertRes;

	// create games
	const createGameResults = await Promise.all([
		createGame(blueParticipant, redParticipant, sessionId, 0, gameSchedules[0], true),
		createGame(redParticipant, blueParticipant, sessionId, 1, gameSchedules[1], false)
 	]);

	// handle createGame errors
	const createGameErrors = createGameResults.filter(isError);
	if(createGameErrors.length > 0){
	 	return joinErrors(createGameErrors);
	}

	// handle createGame results
	const gamesData = createGameResults.filter(isGameData);
	const games = gamesData.map(initGame);

	// create attacks
	const attack = await createAttack({
		gameId: games[0].gameId,
		sessionId: sessionId,
		round: 4,
		audioPath: "foobar",
		sourceUser: "blue",
		targetUser: "red"
	});
	
	if(attack instanceof Error){
		return attack;
	}

	const session = {
		...sessionPartial,
		sessionId
	}

	await initSession(session);

	return session;
}

async function initSession(session: Session): Promise<Either<Error, Session>>{
	const { sessionId } = session;
	log("init session", sessionId);

	// init games
	const gameRows = await getSessionGames(sessionId);
	if(gameRows instanceof Error){
		return gameRows; 
	}

	const games = gameRows.sort((a,b) => a.gameOrder - b.gameOrder)
	.map(row => initGame(row.gameData));

	// schedule attacks
	const attacks = await getAttacks();
	if(attacks instanceof Error){
		return attacks;
	}

	const sessionAttacks = attacks.filter(a => a.sessionId === sessionId);
	const scheduledAttacks = sessionAttacks.map(scheduleAttack);
	const scheduledErrors = scheduledAttacks.filter(isError);
	if(scheduledErrors.length > 0){
		return joinErrors(scheduledErrors);
	}

	// chain games
	games.reduceRight((acc, curr) => {
		curr.on('stop', async () => {
			await setCurrentGame(sessionId, acc.gameId);
		});
		
		return curr;
	});
	
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

// current game

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

function setCurrentGame(sessionId: number, gameId: string) {
	log("set current game", sessionId, gameId);
	return withDb(db => {
		db.serialize(function(){
			db.run("BEGIN TRANSACTION");
			db.run("UPDATE game SET is_current = 0 WHERE session_id = $session_id", {
				$session_id: sessionId
			});
			db.run("UPDATE game SET is_current = 1 WHERE game_id = $game_id", {
				$game_id: gameId
			});
			db.run("COMMIT");
		});
	});
}


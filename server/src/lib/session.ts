import { parallel, chain, map, reject, resolve, FutureInstance } from 'fluture';
import { GameData, Session, AdminClientNs } from 'dfs-common';
import { find, filter, e2f } from './util';
import { createMurmur, initMurmur } from './murmurlib';
import {
	Game,
	getGame,
	createGame,
	gameSchedules,
	initGameRows,
	getSessionGames
} from './game';
import { Logger } from './log';
import { withDb } from './db';
import { createAttack, getAttacks, scheduleAttack } from './attacklib';

const { log } = Logger("session");

export function getPlayerSession(playerId: string){
	return getSessions().pipe(chain(sessions => {
		const playerSession = sessions.find(sess => {
			return sess.blueParticipant === playerId
				|| sess.redParticipant === playerId;
		});

		if(playerSession === undefined){
			return reject(new Error("Player session not found."));
		}
		return resolve(playerSession);
	}));
}

const insertSessionSQL = `
INSERT INTO study_session
(murmur_id, blue_participant, red_participant, murmur_port, grpc_port) 
VALUES ($murmur_id, $blue, $red, $murmur, $grpc);
`;
type InsertSessionParam = Omit<Session, "sessionId">;
function insertSession(session: InsertSessionParam) {
	return withDb(({ run }) =>
		run(insertSessionSQL, {
			$murmur_id: session.murmurId,
			$blue: session.blueParticipant,
			$red: session.redParticipant,
			$murmur: session.murmurPort,
			$grpc: session.grpcPort,
		})
	)
	.pipe((map(sessionId => ({
		...session,
		sessionId
	}))));
}

function normalizeDbSession(db_session: any): Session {
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
export function getSessions(): FutureInstance<Error, Session[]>{
	return withDb(({ all }) =>
		all(selectSessionsSQL)
	)
	.pipe(map(rows => rows.map(normalizeDbSession)))
}

export function getSessionById(sessionId: number): FutureInstance<Error, Session>{
	return getSessions()
	.pipe(map(find(session => session.sessionId === sessionId )))
	.pipe(chain(e2f));
}

function createGameAttack(session: Session, game: GameData){
	const { sessionId } = session;
	const { gameId } = game;
	
	return createAttack({
		gameId,
		sessionId,
		round: 4,
		audioPath: "foobar",
		sourceUser: "1",
		targetUser: "2"
	})
}

function createAttacks(session: Session, games: GameData[]) {
	return parallel(1)(
		games.map(
			game => createGameAttack(session, game)));
}

function createGames(session: Session): FutureInstance<Error, GameData[]> {
	const { blueParticipant, redParticipant, sessionId } = session;
	
	// create games
	return parallel(1)([
		createGame(blueParticipant, redParticipant, sessionId, 0, gameSchedules[0], true),
		createGame(redParticipant, blueParticipant, sessionId, 1, gameSchedules[1], false)
	]);
}

function createGamesAndAttacks(session: Session){
	return createGames(session)
	.pipe(chain(gamesData => createAttacks(session, gamesData)))
	.pipe(map(_attacks => session));
}


export function createSession(
	{ blueParticipant, redParticipant, murmurPort, grpcPort }: AdminClientNs.CreateSessionParams
): FutureInstance<Error, Session> {
	log("create_session", blueParticipant, redParticipant, murmurPort, grpcPort);
	
	return createMurmur({ murmurPort, grpcPort })
	.pipe(map(murmur => ({
		murmurId: murmur.id,
		blueParticipant,
		redParticipant,
		murmurPort,
		grpcPort
	})))
	.pipe(chain(insertSession))
	.pipe(chain(createGamesAndAttacks))
	.pipe(chain(initSession));
}

function chainGames(session: Session){
	return (games: Game[]) => {
		const { sessionId } = session;
		return games.reduceRight((acc, curr) => {
			curr.on('stop', () => {
				setCurrentGame(sessionId, acc.gameId);
			});

			return curr;
		});
	}
}

function initSession(session: Session): FutureInstance<Error, Session> {
	const { sessionId } = session;
	log("init session", sessionId);

	const doGames = () => getSessionGames(sessionId)
		.pipe(map(initGameRows))
		.pipe(chain(e2f))
		.pipe(map(chainGames(session)))

	const doAttacks = () => getAttacks()
		.pipe(map(filter(a => a.sessionId === sessionId)))
		.pipe(map(a => a.map(scheduleAttack)))
		.pipe(chain(parallel(1)));

	const doMurmur = () => initMurmur(session.murmurId);

	const returnSession = () => session;

	return doGames() // init and chain games
		.pipe(chain(doAttacks)) // schedule attacks
		.pipe(chain(doMurmur)) // init murmur container
		.pipe(map(returnSession)); // finally return session
}

export function initSessions(): FutureInstance<Error, Session[]> {
	log("init sessions");

	return getSessions()
	.pipe(map(sessions => sessions.map(initSession)))
	.pipe(chain(parallel(1)));
}

export function getCurrentGame(
	sessionId: number
): FutureInstance<Error, Game>{
	return getSessionGames(sessionId)
	.pipe(map(find(gr => gr.isCurrent === true)))
	.pipe(map(game => game.map(g => g.gameId).chain(getGame)))
	.pipe(chain(e2f));
}

function setCurrentGame(sessionId: number, gameId: string) {
	log("set current game", sessionId, gameId);

	return withDb(({ serialize, run }) => {
		return serialize(
			run("BEGIN TRANSACTION"),
			run("UPDATE game SET is_current = 0 WHERE session_id = $session_id", {
				$session_id: sessionId
			}),
			run("UPDATE game SET is_current = 1 WHERE game_id = $game_id", {
				$game_id: gameId
			}),
			run("COMMIT")
		);
	});
}



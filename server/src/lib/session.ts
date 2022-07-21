import {
	coalesce,
	chainRej,
	mapRej,
	parallel,
	chain,
	map,
	reject,
	resolve,
	FutureInstance,
	fork
} from 'fluture';
import { Session, AdminClientNs } from 'dfs-common';
import { Left, Right } from 'monet';

import { find, filter, e2f } from './util';
import {
	initMurmur,
	createMurmur,
	getMurmurBySessionId,
	removeSessionMurmur
} from './murmurlib';
import {
	Game,
	getGame,
	createGame,
	initGameRows,
	getSessionGames,
	removeSessionGames,
} from './game';
import { gameSchedules } from '../const/gameSchedules';
import { tutorialSchedules } from '../const/tutorialSchedules';
import { debugSchedules } from '../const/debugSchedules';
import { Logger } from './log';
import { withDb } from './db';
import {
	getAttacks,
	scheduleAttack,
	deleteSessionAttacks
} from './attacklib';

const { log, error } = Logger("session");

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
(blue_participant, red_participant, murmur_port, grpc_port) 
VALUES ($blue, $red, $murmurPort, $grpcPort);
`;
type InsertSessionParam = Omit<Session, "sessionId">;
function insertSession(session: InsertSessionParam): FutureInstance<Error, Session> {
	return withDb(({ run }) =>
		run(insertSessionSQL, {
			$blue: session.blueParticipant,
			$red: session.redParticipant,
			$murmurPort: session.murmurPort,
			$grpcPort: session.grpcPort,
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

export function getSessionById(
	sessionId: number
): FutureInstance<Error, Session>{
	return getSessions()
	.pipe(map(find(session => session.sessionId === sessionId )))
	.pipe(chain(e2f));
}


const deleteSessionQuery = `
DELETE FROM study_session
WHERE session_id = $session_id
`;

function deleteSession(session: Session): FutureInstance<Error, Session>{
	const { sessionId } = session;
	return withDb(({run}) => {
		return run(deleteSessionQuery, {
			$session_id: sessionId
		});
	})
	.pipe(map(_ => session));
}

class SessionError extends Error{
	session: Session;
	constructor(session: Session, message: string){
		super(message);
		this.session = session;
		this.name = "SessionError";
	}
}

function createSessionMurmur(session: Session): FutureInstance<SessionError, Session> {
	const { grpcPort, murmurPort, sessionId } = session;
	return createMurmur({grpcPort, murmurPort, sessionId})
	.pipe(map(_ => session))
	.pipe(mapRej(err => new SessionError(session, err.message)));
}

function createSessionGames(session: Session): FutureInstance<SessionError, Session>{
	const { blueParticipant, redParticipant, sessionId } = session;
	return parallel(1)([
		// Commented out debugging rounds - left sessionId as is, incase it breaks anything
		//createGame(blueParticipant, redParticipant, sessionId, 0, debugSchedules[0], true),
		//createGame(redParticipant, blueParticipant, sessionId, 1, debugSchedules[1], false),
		createGame(blueParticipant, redParticipant, sessionId, 0, tutorialSchedules[0], false),
		createGame(redParticipant, blueParticipant, sessionId, 1, tutorialSchedules[1], false),
		createGame(blueParticipant, redParticipant, sessionId, 2, gameSchedules[0], false),
		createGame(redParticipant, blueParticipant, sessionId, 3, gameSchedules[1], false)
	])
	.pipe(map(_games => session))
	.pipe(mapRej(err => new SessionError(session, err.message)));
}

export function createSession(
	params: AdminClientNs.CreateSessionParams
): FutureInstance<Error, Session> {
	log("create_session", JSON.stringify(params));
	return insertSession(params)
	.pipe(chain(createSessionMurmur))
	.pipe(chain(createSessionGames))
	.pipe(chain(initSession))
	.pipe(chainRej(err => {
		error("create_session", err.message);
		if(err instanceof SessionError){
			return removeSession(err.session)
			.pipe(chain(_ => reject(err)));
		}
		return reject(err);
	}));
}

export function removeSession({ sessionId }: Pick<Session,"sessionId">) {
	log("remove_session", sessionId);
	return getSessionById(sessionId)
	.pipe(chain(session =>
		parallel(1) ([
			removeSessionGames(session),
			deleteSessionAttacks(session),
			removeSessionMurmur(session)]
			.map(x => coalesce(Left)(Right)(x)))
		.pipe(chain(_x => deleteSession(session)))));
}

function chainGames(session: Session) {
	return (games: Game[]) => {
		const { sessionId } = session;
		if(games.length === 0){
			return Left(new Error("No games to chain"));
		}
		const reduced = games.reduceRight((acc, curr) => {
			curr.on('stop', () => {
				// Q: How is this usually handled in FP languages?
				// Follow-up Q: Can we refactor s.t. we don't have to fork here?
				fork((err) => {
					error("set current game error", JSON.stringify(err))
				})(() => {
					log("set current game success");
				})(setCurrentGame(sessionId, acc.gameId));
			});

			return curr;
		});
		return Right(reduced);
	}
}


function initSession(session: Session): FutureInstance<SessionError, Session> {
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

	const doMurmur = () => getMurmurBySessionId(sessionId)
	.pipe(chain(initMurmur));

	return doGames() // init and chain games
	.pipe(chain(doAttacks)) // schedule attacks
	.pipe(chain(doMurmur)) // init murmur container
	.pipe(chain(_ => {
		log("init_session", sessionId);
		return resolve(null);
	}))
	.pipe(mapRej(err => {
		error("init_session", sessionId, err.message);
		return new SessionError(session, err.message);
	}))
	.pipe(map(_ => session));
	
}

export function initSessions() {
	return getSessions()
	.pipe(map(sessions => sessions
		.map(s => initSession(s))
		.map(x => coalesce(Left)(Right)(x))
	))
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



// scheduling and run voice injection attacks 

import { mapRej, FutureInstance, map,chain, parallel, fork } from 'fluture';
import path from 'path';
import { Session, ConcreteRoundData } from 'dfs-common';

import { Logger } from './log';
import { GameRow, getGame } from './game';
import { getSessions } from './session';
import { withDb } from './db';
import { execF, find, e2f } from './util';


const { log, error } = Logger('attacklib');

const fakesDir = path.resolve(process.cwd(), 'var/fakes');

type Attack = {
	attackId: number
	sessionId: number
	gameId: string
	round: number
	sourceUser: string
	targetUser: string
	audioPath: string
}


type CreateAttackParams = {
	gameRow: GameRow;
	attackSolution: ConcreteRoundData['attack'] 
	roundIndex: number
	
}
export function createAttack({ gameRow, attackSolution, roundIndex }: CreateAttackParams){
	const { gameId, players } = gameRow.gameData;
	const { sessionId } = gameRow;
	const [ sourceUser, targetUser ] = players.map(p => p.playerId);

	

	const audioPath = path.resolve(
		fakesDir,
		sourceUser,
		`${attackSolution}.wav`);

	return insertAttack({
		gameId,
		sessionId,
		audioPath,
		targetUser,
		sourceUser,
		round: roundIndex
	})
}

const insertAttackQuery = `
INSERT INTO attack
(game_id, session_id, round, source_user, target_user, audio_path)
VALUES ($game_id, $session_id, $round, $source_user, $target_user, $audio_path)
`
export function insertAttack(
	attack: Omit<Attack, "attackId">
): FutureInstance<Error, Attack> {
	log("create", JSON.stringify(attack));
	return withDb(({ run }) =>
		run(insertAttackQuery, {
			$game_id: attack.gameId,
			$session_id: attack.sessionId,
			$round: attack.round,
			$source_user: attack.sourceUser,
			$target_user: attack.targetUser,
			$audio_path: attack.audioPath
		}))
		.pipe(map(attackId => ({
			attackId,
			...attack
		})));
}


export function scheduleAttack(attack: Attack): FutureInstance<Error, Attack> {
	log("schedule", JSON.stringify(attack));

	// TODO: clean-up
	return getSessions()
	.pipe(map(find(s => s.sessionId === attack.sessionId)))
	.pipe(chain(e2f))
	.pipe(map(session => {
		getGame(attack.gameId)
		.map(game =>
			game.on("round", ({ round }: { round: number }) => {
				if (round === attack.round) {
					log(attack.attackId, "launching");

					// mute player
					execF(`mumble-cli 127.0.0.1:${session.grpcPort}`
						+` shadowmute -s 1 -t ${attack.targetUser}`)
					.pipe(chain(muteRes => 
						execF(`mumble-cli 127.0.0.1:${session.grpcPort}`
						+` spoof -s 1 -u ${attack.sourceUser}`
						+` -f ${attack.audioPath} -r 16000`)
					))
					.pipe(fork(err => {
						if(err instanceof Error){
							return error(attack.attackId, err.message);
						}
						error(attack.attackId, "unknown", JSON.stringify(err));
					})(res => {
						log(attack.attackId, "ok", res.trim());
					}))
				}

				if(round === attack.round + 1){
					// unmute player
					execF(`mumble-cli 127.0.0.1:${session.grpcPort}`
						+` shadowmute -s 1 -t ${attack.targetUser} -u`)
					.pipe(fork(err => {
						if(err instanceof Error){
							return error(attack.attackId, err.message);
						}
						return error(attack.attackId, "unknown", JSON.stringify(err));
					})(res => {
						log(attack.attackId, "ok", res.trim());
					}))
				}
			})
		);
		
		return attack;
	}));
}

function normalizeDbAttack(db_attack: any): Attack {
	return {
		attackId: db_attack.attack_id,
		gameId: db_attack.game_id,
		sessionId: db_attack.session_id,
		round: db_attack.round,
		sourceUser: db_attack.source_user,
		targetUser: db_attack.target_user,
		audioPath: db_attack.audio_path
	}
}

export function getAttacks(): FutureInstance<Error, Attack[]>{
	return withDb(({all}) => 
		all("SELECT * FROM attack"))
	.pipe(map(rows => rows.map(normalizeDbAttack)));
}

export function initAttacks(): FutureInstance<Error, Attack[]> {
	// schedule all attacks from database
	log("init");
	return getAttacks()
	.pipe(map(attacks => attacks.map(scheduleAttack)))
	.pipe(chain(parallel(1)));
}

const deleteSessionAttacksQuery = `
DELETE FROM attack
WHERE session_id = $session_id
`;
export function deleteSessionAttacks(session: Session): FutureInstance<Error, Session>{
	const { sessionId } = session;
	log("delete_session_attacks", session.sessionId);
	return withDb(({run}) => {
		return run(deleteSessionAttacksQuery, {
			$session_id: sessionId
		});
	})
	.pipe(map(_ => session))
	.pipe(mapRej(err => {
		error("delete_session_attacks", err.message);
		return err;
	}));
}

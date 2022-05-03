// scheduling and run voice injection attacks 

import { FutureInstance, map,chain, parallel, fork } from 'fluture';
import { Session } from 'dfs-common';
import { Logger } from './log';
import { getGame } from './game';
import { getSessions } from './session';
import { withDb } from './db';
import { execF, find, e2f } from './util';

const { log, error } = Logger('attacklib');

type Attack = {
	attackId: number
	sessionId: number
	gameId: string
	round: number
	sourceUser: string
	targetUser: string
	audioPath: string
}

const insertAttackQuery = `
INSERT INTO attack
(game_id, session_id, round, source_user, target_user, audio_path)
VALUES ($game_id, $session_id, $round, $source_user, $target_user, $audio_path)
`
export function createAttack(
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
						+` send -s 1 -u ${attack.sourceUser} -t ${attack.targetUser} `
						+` -f /Users/alexzugravu/tmp/hello_jack.wav -d 44 -r 16000`)
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
DELETE * from attack
WHERE session_id = $session_id
`;
export function deleteSessionAttacks(sessionId: Session['sessionId']){
	return withDb(({run}) => {
		return run(deleteSessionAttacksQuery, {
			$session_id: sessionId
		});
	})
	.pipe(map(_ => sessionId));
}

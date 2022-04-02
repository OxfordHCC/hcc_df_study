// scheduling and run voice injection attacks 

import { FutureInstance, map,chain, parallel } from 'fluture';

import { Logger } from './log';
import { getGame } from './game';
import { getSessions } from './session';
import { withDb } from './db';
import { execSync } from 'child_process';
import { find, e2f } from './util';

const { log } = Logger('attacklib');

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
					log("launching attack", attack.gameId)
					
					// mute player
					const muteCmd = `mumble-cli 127.0.0.1:${session.grpcPort} shadowmute -s 1 -t ${attack.targetUser}`;
					const muteRes = execSync(muteCmd, { encoding: "utf8" });
					log("attack_status", attack.attackId,  muteCmd, muteRes.trim());

					// send audio
					const shellCmd = `mumble-cli 127.0.0.1:${session.grpcPort} send -s 1 -u ${attack.sourceUser} -t ${attack.targetUser} -f /Users/alexzugravu/tmp/hello_jack.wav -d 44 -r 16000`;
					const res = execSync(shellCmd, { encoding: "utf8" });
					log("attack_status", attack.attackId, shellCmd, res.trim());


				}

				if(round === attack.round + 1){
					// unmute player
					const unmuteCmd = `mumble-cli 127.0.0.1:${session.grpcPort} shadowmute -s 1 -t ${attack.targetUser} -u`;
					const unmuteRes = execSync(unmuteCmd, { encoding: "utf8" });
					log("attack_status", attack.attackId, unmuteCmd, unmuteRes.trim());
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

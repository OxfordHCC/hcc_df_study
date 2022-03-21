// this library is tasked with scheduling and running voice injection attacks
// on the study environment
import { Logger } from './log';
import { getGame } from './game';
import { getSessions } from './session';
import { withDb } from './db';
import { Either, isError, Session } from 'dfs-common';
import { execSync } from 'child_process';

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
export async function createAttack(attack: Omit<Attack, "attackId">):Promise<Either<Error, Attack>>{
	log("create", JSON.stringify(attack));
	return withDb<Attack>(db => new Promise((resolve, reject) => {
		db.run(insertAttackQuery, {
			$game_id: attack.gameId,
			$session_id: attack.sessionId,
			$round: attack.round,
			$source_user: attack.sourceUser,
			$target_user: attack.targetUser,
			$audio_path: attack.audioPath
		}, function(err){
			if(err){
				return reject(err);
			}

			const attackId = this.lastID;
			
			resolve({
				...attack,
				attackId
			});
		})
	}));
}

export async function scheduleAttack(attack: Attack){
	const game = getGame(attack.gameId);
	if(game instanceof Error){
		return game;
	}

	const sessions = await getSessions();
	if(sessions instanceof Error){
		return sessions;
	}

	const session = sessions.find(s => s.sessionId === attack.sessionId);
	if(session === undefined){
		return new Error("Session not found for attack.");
	}

	log("schedule", JSON.stringify(attack));

	// TODO handle errors
	// register event handler to trigger the attack
	game.on("round", ({ round }: { round: number }) => {
		console.log(round, attack.round, round === attack.round);
		if(round === attack.round) {
			log("launching attack", attack.gameId)
			// launch attack

			// TODO: mute source player

			// send audio
			const shellCmd = `mumble-cli 127.0.0.1:${session.grpcPort} send -s 1 -u 1 -t 2 -f /Users/alexzugravu/tmp/hello_jack.wav -d 44 -r 16000`;
			const res = execSync(shellCmd, { encoding: "utf8" });
			log("attack_status", shellCmd, res.trim());
			// TODO: unmute source player
			
		}
	});
}

function normalizeDbAttack(db_attack: any): Attack{
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

export function getAttacks(): Promise<Either<Error, Attack[]>>{
	return withDb(db => new Promise((resolve, reject) => {
		db.all("SELECT * FROM attack", (err, rows) => {
			if(err){
				return reject(err);
			}
			
			return resolve(rows.map(normalizeDbAttack));
		})
	}));
}

export async function initAttacks(){
	// schedule all attacks from database
	log("init");
	const attacks = await getAttacks();
	if(attacks instanceof Error){
		return attacks;
	}
	
	const scheduleRes = await Promise.all(attacks.map(scheduleAttack));
	const scheduleErrors = scheduleRes.filter(isError);
	if(scheduleErrors.length > 0){
		return 0;
	}
}

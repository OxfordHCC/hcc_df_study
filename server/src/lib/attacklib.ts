// this library is tasked with scheduling and running voice injection attacks
// on the study environment
import { Logger } from './log';
import { getGame } from './game';

const { log } = Logger('attacklib');

type Attack = {
	gameId: string
	round: number
	sourceUser: string
	targetUser: string
	audioPath: string
}

export function createAttack(attack: Attack){
	log("create", JSON.stringify(attack));
	// insert new attack in database
}
export function scheduleAttack(attack: Attack){
	log("schedule", JSON.stringify(attack));
	
	const game = getGame(attack.gameId);
	if(game instanceof Error){
		return game;
	}

	// register event handler to trigger the attack
	game.on("round", ({ round }: { round: number }) => {
		if (round === attack.round) {
			// launch attack
			// send audio
		}
	});
}

export function initAttacks(){
	log("init");
	// get all attacks from database
	// for each attack, schedule attack
}



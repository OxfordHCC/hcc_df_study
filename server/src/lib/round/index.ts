import { RoundData, Either, Solution } from 'dfs-common';
import { Round } from './round';
import { ButtonRound } from './button';

export * from './keypad';
export * from './button';
export * from './round';

export function isRound(round: any): round is Round {
	return round instanceof Round;
}

export function createRound(data: RoundData): Either<Error, Round>{
	switch(data.name){
		case "button":
			if(!isSingleSolution(data.solution)){
				return new Error(
					"Invalid solution type. Must be number.")
			}
			return new ButtonRound(data.solution);
		default:
			return new Error("Unknown round name.")
	}
}

function isSingleSolution(x: Solution): x is number{
	return typeof x === "number";
}

function isSequenceSolution(sol: Solution): sol is number[]{
	if(!Array.isArray(sol)){
		return false;
	}
	
	return sol.every(x => typeof x === "number");
}

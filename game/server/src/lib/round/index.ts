import { ConcreteRoundData, Solution } from 'dfs-common';

export * from './keypad';
export * from './button';
export * from './round';
import { Round } from './round';
import { Either } from '../fp';
import { ButtonRound } from './button';

export function isRound(round: any): round is Round {
	return round instanceof Round;
}

export function createRound(data: ConcreteRoundData): Either<Round, Error>{
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

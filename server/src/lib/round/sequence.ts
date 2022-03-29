import { Solution, Answer, RoundData } from 'dfs-common';
import { Round } from './round';

type SequenceRoundParams = RoundData & {
	solution: number[]
}
type SequenceRoundAnswer = Answer & {
	value: number,
	step: number,	
}
export class SequenceRound extends Round{
	constructor({
		msLength,
		name,
		solution
	}: SequenceRoundParams){
		super({ msLength, name, solution });
	}
	
	onAnswer({ value, step }: SequenceRoundAnswer){
		console.error("sequenceRound onAnswer not implemented", value, step)
		return 1;
	}
}

export function isSequenceSolution(sol: Solution): sol is number[]{
	if(!Array.isArray(sol)){
		return false;
	}
	
	return sol.every(x => typeof x === "number");
}

import { Answer, RoundData } from 'dfs-common';
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
		return 1;
	}
}


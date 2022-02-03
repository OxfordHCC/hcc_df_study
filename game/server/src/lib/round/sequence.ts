import { Round, RoundParams, Answer } from 'dfs-common';

type SequenceRoundParams = RoundParams & {
	msLength: number
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


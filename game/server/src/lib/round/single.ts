import { Round, Answer, RoundParams } from 'dfs-common';


// A single round has a single step
type SingleRoundParams = RoundParams & {
	solution: number
	options: number[],
}

type SingleRoundAnswer = Answer & {
	value: number
}
export class SingleRound extends Round{
	answer: number | null = null;
	options: number[];
	
	constructor({ name, msLength, solution, options }: SingleRoundParams) {
		super({ msLength, name, solution });
		this.options = options;
	}

	onAnswer({ value }: SingleRoundAnswer){
		this.answer = value;
		this.endTime = Date.now();

		if (value === this.solution){
			return 1;
		}
		
		return -1;
	}
}

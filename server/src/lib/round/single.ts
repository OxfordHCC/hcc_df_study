import {
	SingleRoundAnswer,
	SingleRoundData
} from 'dfs-common';

import { Round } from './round';

export class SingleRound
extends Round
implements SingleRoundData {
	options: number[];
	solution: number;
	
	constructor({ name, msLength, solution, options }: SingleRoundData
	) {
		super({ msLength, name, solution });
		this.options = options;
		this.solution = solution;
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

export function isSingleRoundData(x: any): x is SingleRoundData{
	return x!== undefined
		&& typeof x.solution === "number"
		&& Array.isArray(x.options)
		&& x.options.every((opt: unknown) => typeof opt === "number");
}

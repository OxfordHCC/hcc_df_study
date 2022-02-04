import {
	RoundData,
	RoundName,
	Solution,
	Answer
} from 'dfs-common';

export abstract class Round implements RoundData{
	name: RoundName
	msLength: number
	solution: Solution
	answer?: Solution
	startTime?: number
	endTime?: number
	
	constructor({ msLength, name, solution }: RoundData) {
		this.msLength = msLength;
		this.name = name;
		this.solution = solution;
	}

	abstract onAnswer(answer: Answer): number
}

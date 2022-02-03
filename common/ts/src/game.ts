
export type Answer = {
	round: number,
	[index: string]: any
}

type Solution = number | number[];
export type RoundParams = {
	msLength: number,
	name: string,
	solution: Solution
}

export abstract class Round {
	startTime?: number
	endTime?: number
	name: string
	msLength: number
	solution: Solution

	constructor({ msLength, name, solution }: RoundParams) {
		this.msLength = msLength;
		this.name = name;
		this.solution = solution;
	}
	
	abstract onAnswer(answer: Answer): number
}

export class Player {
	playerId: string;
	ready: boolean;
}

export type GameEvents = {
	"start": () => void,
	"stop": () => void,
	"state": () => void,
	"answer": () => void,
	"error": () => void,
	"round": () => void,
	"player_ready": () => void
}

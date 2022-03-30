import { Answer } from './game';

export type SingleRoundName = "button" | "wire" | "pseudoKeypad";
export type SequenceRoundName = "keypad";
export type RoundName =
	| SingleRoundName
	| SequenceRoundName;

function isRoundName(x: any): x is RoundName{
	return x === "button"
		|| x === "wire"
		|| x === "keypad";
}

export type Solution =
	| number
	| number[];

function isSolution(x: any): x is Solution{
	return typeof x === "number"
		|| Array.isArray(x) && x.every(xi => typeof xi === "number");
}

export interface RoundData {
	name: RoundName
	msLength: number
	solution: Solution
	answer?: Solution
	startTime?: number
	endTime?: number
}
export function isRoundData(x: any): x is RoundData{
	return isRoundName(x.name)
		&& typeof x.msLength === "number"
		&& isSolution(x.solution)
		&& (x.answer === undefined || isSolution(x.answer))
		&& (x.startTime === undefined || typeof x.startTime === "number")
		&& (x.endTime === undefined || typeof x.endTime === "number");
}

export interface SingleRoundData extends RoundData{
	solution: number
	options: number[],
}

export type SingleRoundAnswer = Answer & {
	value: number
}

export type ButtonRoundAnswer = SingleRoundAnswer;
export interface ButtonRoundData extends SingleRoundData {
	name: "button"
}

// These are the only ones that are not abstract
export type ConcreteRoundData = ButtonRoundData;

import { Answer } from './game';

export type SingleRoundName = "button" | "wire";
export type SequenceRoundName = "keypad";
export type RoundName =
	| SingleRoundName
	| SequenceRoundName;

export type Solution =
	| number
	| number[];

export interface RoundData {
	name: RoundName
	msLength: number
	solution: Solution
	answer?: Solution
	startTime?: number
	endTime?: number
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

import { Answer } from './game';
export declare type SingleRoundName = "button" | "wire";
export declare type SequenceRoundName = "keypad";
export declare type RoundName = SingleRoundName | SequenceRoundName;
export declare type Solution = number | number[];
export interface RoundData {
    name: RoundName;
    msLength: number;
    solution: Solution;
    answer?: Solution;
    startTime?: number;
    endTime?: number;
}
export interface SingleRoundData extends RoundData {
    solution: number;
    options: number[];
}
export declare type SingleRoundAnswer = Answer & {
    value: number;
};
export declare type ButtonRoundAnswer = SingleRoundAnswer;
export interface ButtonRoundData extends SingleRoundData {
    name: "button";
}
export declare type ConcreteRoundData = ButtonRoundData;

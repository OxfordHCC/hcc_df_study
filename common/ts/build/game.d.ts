export declare type Answer = {
    round: number;
    [index: string]: any;
};
declare type Solution = number | number[];
export declare type RoundParams = {
    msLength: number;
    name: string;
    solution: Solution;
};
export declare abstract class Round {
    startTime?: number;
    endTime?: number;
    name: string;
    msLength: number;
    answered: boolean;
    solution: Solution;
    constructor({ msLength, name, solution }: RoundParams);
    abstract onAnswer(answer: Answer): number;
}
export declare class Player {
    playerId: string;
    ready: boolean;
}
export declare type GameEvents = {
    "start": () => void;
    "stop": () => void;
    "state": () => void;
    "answer": () => void;
    "error": () => void;
    "round": () => void;
    "player_ready": () => void;
};
export {};

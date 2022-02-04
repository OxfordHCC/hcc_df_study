import { RoundData } from './round';
export declare type Answer = {
    round: number;
    [index: string]: any;
};
export interface Player {
    playerId: string;
    ready: boolean;
}
export interface GameData {
    players: Player[];
    gameId: string;
    rounds: RoundData[];
    currentRound: number;
    startTime?: number;
    endTime?: number;
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

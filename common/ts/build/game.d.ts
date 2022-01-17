export declare type Task = {
    taskType: "wire" | "button";
    options: number[];
    correctOption: number;
};
export declare type Round = {
    roundNumber: number;
    task: Task;
    answer?: number;
    startTime: number;
    answerTime?: number;
};
export interface Player {
    playerId: string;
    ready: boolean;
}
export interface GameState {
    gameId: string;
    players: Player[];
    startTime?: number;
    rounds: Round[];
    msRoundLength: number;
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
export declare type ClientTask = Omit<Task, "correctOption"> & {
    correctOptions?: number;
};
export declare type ClientRound = Round & {
    task: ClientTask;
};
export declare type ClientGameState = GameState & {
    rounds: ClientRound[];
};

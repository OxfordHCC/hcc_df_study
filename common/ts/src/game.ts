export type Task = {
	taskType: "wire" | "button",
	options: number[],
	correctOption: number,
}

export type Round = {
	roundNumber: number,
	task: Task,
	answer?: number,
	startTime: number,
	answerTime?: number
}

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

export type GameEvents = {
	"start": () => void,
	"stop": () => void,
	"state": () => void,
	"answer": () => void,
	"error": () => void,
	"round": () => void,
	"player_ready": () => void
}

export type ClientTask = Omit<Task, "correctOption"> & {
	correctOptions?: number;
}

export type ClientRound = Round & {
	task: ClientTask
}

export type ClientGameState = GameState & {
	rounds: ClientRound[]
}

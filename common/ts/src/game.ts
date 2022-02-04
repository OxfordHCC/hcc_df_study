import { RoundData } from './round';

export type Answer = {
	round: number,
	[index: string]: any
}

export interface Player {
	playerId: string;
	ready: boolean;
}

export interface GameData {
	players: Player[]
	gameId: string
	rounds: RoundData[]
	startTime?: number
	endTime?: number
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

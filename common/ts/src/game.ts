import { RoundData, isRoundData } from './round';

export type Answer = {
	round: number,
	[index: string]: any
}

export interface Player {
	playerId: string;
	ready: boolean;
}

export function isPlayer(x: any): x is Player{
	return typeof x.playerId === "string"
		&& typeof x.ready === "boolean";
}

export interface GameData {
	players: Player[]
	gameId: string
	rounds: RoundData[]
	currentRound: number
	startTime?: number
	endTime?: number
}

export function isGameData(x: any): x is GameData{
	return x.players !== undefined && Array.isArray(x.players) && x.players.every(isPlayer)
		&& typeof x.gameId === "string"
		&& x.rounds.every(isRoundData)
		&& typeof x.currentRound === "number"
		&& (x.startTime === undefined || typeof x.startTime === "number")
		&& (x.endTine === undefined || typeof x.endTime === "number");
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




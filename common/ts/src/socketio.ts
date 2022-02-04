import { Answer, GameData, Player } from './game';
import { RoundData } from './round';

type AckCb<T> = (e: Error, data: T) => void;

export interface ServerToClientEvents {
	error: (msg: string) => void;
	state: (state: GameData) => void;
	init: (states: GameData[]) => void;
}

type CreateGameParams = {
	blue: Player,
	red: Player,
	roundsData: RoundData[]
}
export interface ClientToServerEvents {
	"create_game": ({ blue, red, roundsData}: CreateGameParams, cb: AckCb<GameData>) => void
	"game:player_ready": (readyFlag: boolean) => void
	"game:answer": (answer: Answer) => void
}

export interface InterServerEvents{
	// not doing inter-server comms atm
}

export interface SocketData{
	gameId: string
	playerId: string
}

import { Answer, GameData, Player } from './game';
import { ConcreteRoundData } from './round';

type AckCb<T> = (e: Error, data: T) => void;

export namespace GameClientNs{
	export interface ServerToClientEvents {
		error: (msg: string) => void;
		state: (state: GameData) => void;
		init: (states: GameData[]) => void;
	}

	export interface ClientToServerEvents {
		"game:player_ready": (readyFlag: boolean) => void
		"game:answer": (answer: Answer) => void
	}

	export interface InterServerEvents {
		// not doing inter-server comms atm
	}

	export interface SocketData {
		gameId: string
		playerId: string
	}
}

export namespace AdminClientNs{
	export interface ServerToClientEvents {
	}

	type CreateGameParams = {
		blue: string,
		red: string,
		roundsData: ConcreteRoundData[]
	}

	export interface ClientToServerEvents {
		"create_game": ({ blue, red, roundsData }: CreateGameParams, cb: AckCb<GameData>) => void
	}

	export interface InterServerEvents {
		// not doing inter-server comms atm
	}

	export interface SocketData {
	}

}

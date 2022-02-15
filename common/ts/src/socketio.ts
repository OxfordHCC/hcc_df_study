import { Answer, GameData } from './game';
import { ConcreteRoundData } from './round';

type AckCb<T> = (error: Error | null, data: T | null) => void;


export namespace GameClientNs {
	export interface ServerToClientEvents {
		error: (msg: string) => void;
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

export namespace AdminClientNs {
	export interface ServerToClientEvents {
		error: (msg: string) => void;
		state: (state: GameData) => void;
		init: (states: GameData[]) => void;
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

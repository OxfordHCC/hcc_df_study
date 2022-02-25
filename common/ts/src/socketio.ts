import { Answer, GameData } from './game';
import { Session } from './session';

type AckCb<T> = (error?: Error, data?: T) => void

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

	export type CreateSessionParams = Omit<Session,	"murmurId" | "sessionId" | "gameId">;

	export interface ClientToServerEvents {
		"create_session": (params: CreateSessionParams, cb: AckCb<Session>) => void
		"get_sessions": (cb: AckCb<Session[]>) => void
	}

	export interface InterServerEvents {
		// not doing inter-server comms atm
	}

	export interface SocketData {
	}

}

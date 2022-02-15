import { Answer, GameData } from './game';
import { ConcreteRoundData } from './round';
declare type AckCb<T> = (e: Error, data: T) => void;
export declare namespace GameClientNs {
    interface ServerToClientEvents {
        error: (msg: string) => void;
        state: (state: GameData) => void;
        init: (states: GameData[]) => void;
    }
    interface ClientToServerEvents {
        "game:player_ready": (readyFlag: boolean) => void;
        "game:answer": (answer: Answer) => void;
    }
    interface InterServerEvents {
    }
    interface SocketData {
        gameId: string;
        playerId: string;
    }
}
export declare namespace AdminClientNs {
    export interface ServerToClientEvents {
    }
    type CreateGameParams = {
        blue: string;
        red: string;
        roundsData: ConcreteRoundData[];
    };
    export interface ClientToServerEvents {
        "create_game": ({ blue, red, roundsData }: CreateGameParams, cb: AckCb<GameData>) => void;
    }
    export interface InterServerEvents {
    }
    export interface SocketData {
    }
    export {};
}
export {};

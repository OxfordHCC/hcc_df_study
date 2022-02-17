import { Answer, GameData } from './game';
declare type AckCb<T> = (error: Error | null, data: T | null) => void;
export declare namespace GameClientNs {
    interface ServerToClientEvents {
        error: (msg: string) => void;
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
        error: (msg: string) => void;
        state: (state: GameData) => void;
        init: (states: GameData[]) => void;
    }
    type CreateSessionParams = {
        blue: string;
        red: string;
        murmurPort: number;
        grpcPort: number;
    };
    export interface ClientToServerEvents {
        "create_session": ({ blue, red }: CreateSessionParams, cb: AckCb<GameData>) => void;
    }
    export interface InterServerEvents {
    }
    export interface SocketData {
    }
    export {};
}
export {};

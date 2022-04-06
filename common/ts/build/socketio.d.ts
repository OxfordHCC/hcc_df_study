import { Answer, GameData } from './game';
import { Session } from './session';
import { RecFile } from './rec';
declare type AckCb<T> = (error?: Error, data?: T) => void;
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
    interface ServerToClientEvents {
        error: (msg: string) => void;
        state: (state: GameData) => void;
        init: (states: GameData[]) => void;
    }
    type CreateSessionParams = Omit<Session, "murmurId" | "sessionId" | "gameId">;
    type GetRecordingsParams = Pick<Session, "sessionId">;
    interface ClientToServerEvents {
        "create_session": (params: CreateSessionParams, cb: AckCb<Session>) => void;
        "get_sessions": (cb: AckCb<Session[]>) => void;
        "get_recordings": (params: GetRecordingsParams, cb: AckCb<RecFile[]>) => void;
    }
    interface InterServerEvents {
    }
    interface SocketData {
    }
}
export {};

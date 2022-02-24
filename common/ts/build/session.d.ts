import { AdminClientNs } from './socketio';
import { Either } from './util';
export declare type Session = {
    sessionId: number;
    gameId: string;
    murmurId: string;
    blueParticipant: string;
    redParticipant: string;
    murmurPort: number;
    grpcPort: number;
};
export declare function validateCreateSessionParams(params: AdminClientNs.CreateSessionParams): Array<Error>;
export declare function valiturnCreateSessionParams(params: Partial<AdminClientNs.CreateSessionParams>): Either<Error, AdminClientNs.CreateSessionParams>;

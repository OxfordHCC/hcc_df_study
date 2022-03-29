import { AdminClientNs } from './socketio';

export type Session = {
	sessionId: number;
	murmurId: string;
	blueParticipant: string;
	redParticipant: string;
	murmurPort: number;
	grpcPort: number;
};



export function valiturnCreateSessionParams(
	params: Partial<AdminClientNs.CreateSessionParams>
): Either<Error, AdminClientNs.CreateSessionParams>{
	const definedParams = validateRequired(params);
	if(definedParams instanceof Error){
		return definedParams;
	}

	return definedParams;
}

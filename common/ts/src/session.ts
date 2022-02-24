import { AdminClientNs } from './socketio';
import { Either } from './util';

export type Session = {
	sessionId: number;
	gameId: string;
	murmurId: string;
	blueParticipant: string;
	redParticipant: string;
	murmurPort: number;
	grpcPort: number;
};

function validateCheckUndefined(entries: Array<[string, any]>){
	return entries.filter(([key, val]) => val === undefined)
	.map(([key, _val]) => new Error(`${key} undefined`));
}

function validateRequired<T>(params: T): Either<Error,Required<T>>{
	const errors = Object.entries(params)
	.filter(([key, val]) => val === undefined)
	.map(([key, _val]) => `${key} undefined`);

	if(errors.length > 0){
		return new Error(errors.join('\n'));
	}
	
	return params as Required<T>;
}

export function validateCreateSessionParams(
	params: AdminClientNs.CreateSessionParams
): Array<Error> {
	let errors: Array<Error> = [];
	errors = errors.concat(
		validateCheckUndefined(
			Object.entries(params)
		)
	);
	
	return errors;
}

export function valiturnCreateSessionParams(
	params: Partial<AdminClientNs.CreateSessionParams>
): Either<Error, AdminClientNs.CreateSessionParams>{
	const definedParams = validateRequired(params);
	if(definedParams instanceof Error){
		return definedParams;
	}

	return definedParams;
}

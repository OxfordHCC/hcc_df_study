import { Either, Left } from 'monet';

import { RoundData } from 'dfs-common';
import { Round } from './round';
import { createButtonRound } from './button';

export * from './keypad';
export * from './button';
export * from './round';

export function isRound(round: any): round is Round {
	return round instanceof Round;
}

export function createRound(data: RoundData): Either<Error, Round>{
	switch(data.name){
		case "button":
			return createButtonRound(data);
		default:
			return Left(new Error("Unknown round name."));
	}
}

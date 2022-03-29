import { Either, Left, Right } from 'monet';
import { ButtonRoundData } from 'dfs-common';
import { isSingleRoundData, SingleRound } from './single';

export class ButtonRound extends SingleRound implements ButtonRoundData {
	name: "button" = "button"
	constructor(solution: number, msLength: number = 5000) {
		super({
			name: "button",
			solution,
			options: [ 0, 1, 2, 3 ],
			msLength: msLength,
		});
	}
}

export function createButtonRound(data: any): Either<Error, ButtonRound>{
	if(!isButtonRoundData(data)){
		return Left(new Error("Invalid round data."));
	}
	return Right(new ButtonRound(data.solution, data.msLength));
}

function isButtonRoundData(x: any): x is ButtonRoundData{
	return isSingleRoundData(x);
}

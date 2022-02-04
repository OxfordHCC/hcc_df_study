import { SingleRound } from './single';
import { ButtonRoundData } from 'dfs-common';


export class ButtonRound extends SingleRound implements ButtonRoundData{
	name: "button" = "button"

	constructor(solution: number, msLength: number = 5000){
		super({
			name: "button",
			solution,
			options: [ 0, 1, 2, 3 ],
			msLength: msLength,
		});
	}
}

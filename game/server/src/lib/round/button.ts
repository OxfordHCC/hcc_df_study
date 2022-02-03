import { SingleRound } from './single';

export class ButtonRound extends SingleRound{
	constructor(solution: number, msLength: number = 5000){
		super({
			name: "button",
			solution,
			options: [0,1,2,3],
			msLength: msLength
		});
	}
}

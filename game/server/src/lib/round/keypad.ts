import { SequenceRound } from './sequence';


export class KeypadRound extends SequenceRound{
	constructor(solution: number[]){
		super({
			solution,
			name: "keypad",
			msLength: 10*1000
		});
	}
}

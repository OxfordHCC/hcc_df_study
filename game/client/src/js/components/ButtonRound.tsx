import React from 'react';
import { ButtonRoundData } from 'dfs-common';

type ButtonRoundParams = {
	round: ButtonRoundData,
	onTaskSubmit: (answer: number) => void
}
export function ButtonRound({ round, onTaskSubmit }: ButtonRoundParams): JSX.Element{
	const { solution } = round;

	// if player blue, show solution
	if (solution !== undefined){
		// show correct answer
		return <p>Press {correctOption}</p>
	}

	const buttons = task.options.map(o =>
		<button key={o} onClick={() => onTaskSubmit(o)}>{o}</button>);
	
	return (
		<div>
			{buttons}
		</div>
	);
}


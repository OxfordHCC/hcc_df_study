import React from 'react';
import { ButtonRoundData, ButtonRoundAnswer } from 'dfs-common';

type ButtonRoundParams = {
	round: number
	roundData: ButtonRoundData
	onAnswer: (answer: ButtonRoundAnswer) => void
	isBlue: boolean
}
export function ButtonRound({ round, roundData, onAnswer, isBlue }: ButtonRoundParams): JSX.Element{
	const { solution } = roundData;

	// if player blue, show solution	
	if (isBlue){
		return <p>Press {solution}</p>
	}
	
	const buttons = roundData.options.map(option => 
		<button
			key={option}
			onClick={() => onAnswer({ round, value: option })}>
			{option}
		</button>);
	
	return (
		<div>
			{buttons}
		</div>
	);
}


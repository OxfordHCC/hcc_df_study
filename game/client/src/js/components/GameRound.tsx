import React from 'react';
import { RoundData } from 'dfs-common';
import { ButtonRound } from './ButtonRound';
import { Clock } from './Clock';

type GameRoundParam = {
	round: RoundData,
	onAnswer: (answer: number, round: number) => void
}
export function GameRound({ round, onAnswer }: GameRoundParam): JSX.Element{
	const { name } = round;

	function onTaskSubmit(option: number) {
		onAnswer(option, round);
	}

	return (
		<div>
			<Clock start={round.startTime} length={round.msLength} />
			{
				(name ==="button")
				? <ButtonRound round={round} onTaskSubmit={onTaskSubmit}/>
				: <>Unknown round name</>
			}
			
		</div>
	);
}

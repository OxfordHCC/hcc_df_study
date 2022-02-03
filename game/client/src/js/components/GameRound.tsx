import React from 'react';
import { ClientRound } from 'dfs-common';
import { ButtonTask } from './ButtonTask';
import { Clock } from './Clock';

type GameRoundParam = {
	round: ClientRound,
	onAnswer: (answer: number, round: number) => void
}
export function GameRound({ round, onAnswer }: GameRoundParam): JSX.Element{
	const taskType = round.task.taskType;

	function onTaskSubmit(option: number){
		onAnswer(option, round.roundNumber);
	}


	if(taskType === "button"){
		return (
			<div>
				<Clock start={round.startTime} length={round.length} />
				<ButtonTask task={round.task} onTaskSubmit={onTaskSubmit} />
			</div>
		);
	}

	return <p>Game error: unknown task type</p>
}

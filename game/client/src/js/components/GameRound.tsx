import React from 'react';
import { ClientRound } from 'dfs-common';
import { ButtonTask } from './ButtonTask';


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
			<ButtonTask task={round.task} onTaskSubmit={onTaskSubmit}/>
		);
	}

	return <p>Game error: unknown task type</p>
}

import React from 'react';
import { ClientTask } from 'dfs-common';


type ButtonTaskParams = {
	task: ClientTask,
	onTaskSubmit: (answer: number) => void
}
export function ButtonTask({ task, onTaskSubmit }: ButtonTaskParams): JSX.Element{
	const { correctOption } = task;

	// player knows the correct answer
	if (correctOption !== undefined){
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


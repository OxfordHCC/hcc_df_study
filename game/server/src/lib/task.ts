import { Task } from 'dfs-common';


const tasks: Task[] = [
	{
		taskType: "button",
		options: [0,1,2,3],
		correctOption: 1
	},
	{
		taskType: "button",
		options: [0, 1, 2, 3],
		correctOption: 0
	},
	{
		taskType: "button",
		options: [0, 1, 2, 3],
		correctOption: 3
	},
	{
		taskType: "button",
		options: [0, 1, 2, 3],
		correctOption: 2
	},
	{
		taskType: "button",
		options: [0, 1, 2, 3, 4],
		correctOption: 4
	}
];

export function getTask(roundNumber: number): Task {
	return tasks[roundNumber];
}

export function getTasksLength(): number{
	return tasks.length;
}

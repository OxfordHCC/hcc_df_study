import React from 'react';
import { ClientRound } from 'dfs-common';

type RoundReviewRowParams = {
	round: ClientRound
	roundNumber: number
}
export function RoundReviewRow({round, roundNumber} : RoundReviewRowParams): JSX.Element{
	return (
		<tr>
			<td>{roundNumber}</td>
			<td>{(round.answer !== undefined) ? round.answer : "No answer"}</td>
			<td>{round.task.correctOption}</td>
		</tr>
	);
}


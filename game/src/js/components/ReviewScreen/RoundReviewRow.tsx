import React from 'react';
import { RoundData } from 'dfs-common';

type RoundReviewRowParams = {
	round: RoundData
	roundNumber: number
}
export function RoundReviewRow({round, roundNumber} : RoundReviewRowParams): JSX.Element{
	return (
		<tr>
			<td>{roundNumber}</td>
			<td>{(round.answer !== undefined) ? round.answer : "No answer"}</td>
			<td>{round.solution}</td>
		</tr>
	);
}


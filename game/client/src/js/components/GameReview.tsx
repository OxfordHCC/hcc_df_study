import React from 'react';
import { ClientGameState } from 'dfs-common';
import { RoundReviewRow } from './RoundReviewRow';
import { Screen } from './Screen';
import styled from 'styled-components';

type GameReviewParams = {gameState: ClientGameState};
export function GameReview({gameState} : GameReviewParams): JSX.Element{
	const { rounds } = gameState;
	const correctLen = rounds.filter(r => r.answer === r.task.correctOption).length;
	
	return (
		<Screen>
			<div>Game finished</div>
			<div>{correctLen}/{rounds.length} correct</div>
			<ReviewTable>
				<thead>
					<tr>
						<th>Round</th>
						<th>Answer</th>
						<th>Correct</th>
					</tr>
				</thead>
				<tbody>
					{rounds.map((round, i) => <RoundReviewRow roundNumber={i} round={round} key={i}/>)}
				</tbody>
			</ReviewTable>
		</Screen>
	);
}

const ReviewTable = styled.table`
	text-align: center;
`;

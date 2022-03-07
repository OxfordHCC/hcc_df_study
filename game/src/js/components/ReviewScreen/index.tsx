import React from 'react';
import styled from 'styled-components';
import { GameData } from 'dfs-common';
import { RoundReviewRow } from './RoundReviewRow';
import { Screen } from '../Screen';
import { Center } from '../Center';


type GameReviewParams = {
	gameData: GameData
};
export function GameReview(
	{ gameData }: GameReviewParams
): JSX.Element{
	const { rounds } = gameData;
	const correctLen = rounds
		.filter(r => {
			return r.answer !== undefined
				&& r.answer === r.solution;
		})
		.length;

	return (
		<Screen>
			<Center>
					<div>
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
								{
									rounds.map(
										(round, i) => <RoundReviewRow roundNumber={i} round={round} key={i} />
									)
								}
							</tbody>
						</ReviewTable>
					</div>

			</Center>
		</Screen>
	);
}

const ReviewTable = styled.table`
	text-align: center;
`;

const RoundContainer = styled.div`
	
`;

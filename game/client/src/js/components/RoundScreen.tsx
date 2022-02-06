import React from 'react';
import { Answer, GameData } from 'dfs-common';
import { Screen } from './Screen';
import { Round } from './Round';
import styled from 'styled-components';

type RoundScreenParams = {
	gameData: GameData
	playerId: string
	onAnswer: (a: Answer) => void
}
export function RoundScreen({ gameData, playerId, onAnswer }: RoundScreenParams){
	const { rounds, players, currentRound } = gameData;
	
	const isBlue = playerId === players[0].playerId;
	const currRoundData = rounds[0];

	const score = rounds.map(round => {
		return round.answer !== undefined
			&& round.answer === round.solution
			? 1 : 0
	}).reduce((acc: number, curr) => acc + curr, 0);

	const total = rounds
		.map(r => (r.answer !== undefined)? 1 : 0)
		.reduce((acc: number, curr) => acc + curr, 0);

	return (
		<Screen>
			<GameDataContainer>
				<div>
					<div>Blue: {players[0].playerId}</div>
					<div>Red: {players[1].playerId}</div>
				</div>

				<div>
					<h3>Round {currentRound}</h3>
					<div>Score: {score}/{total}</div>
				</div>
			</GameDataContainer>
			<Round round={currentRound}
				roundData={currRoundData}
				onAnswer={onAnswer}
				isBlue={isBlue} />
		</Screen>
	);
}

const GameDataContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

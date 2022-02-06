import React from 'react';
import { RoundData, Answer, ButtonRoundData, RoundName } from 'dfs-common';
import { ButtonRound } from './ButtonRound';
import { Clock } from './Clock';
import { Switch, Case, DefaultCase } from './Switch';
import styled from 'styled-components';

type RoundParam = {
	round: number
	roundData: RoundData
	onAnswer: (answer: Answer) => void
	isBlue: boolean
}

export function Round({ isBlue, roundData, round, onAnswer }: RoundParam): JSX.Element{
	const { name } = roundData;

	return (
		<RoundContainer>
			<ClockContainer>
				<Clock
					start={roundData.startTime}
					length={roundData.msLength} />
			</ClockContainer>
			<RoundContentContainer>
				<Switch<RoundName> on={name}>
					<Case when="button">
						<ButtonRound
							isBlue={isBlue}
							round={round}
							roundData={roundData as ButtonRoundData}
							onAnswer={onAnswer}
						/>
					</Case>
					<DefaultCase>
						<p>Unknown Round...</p>
					</DefaultCase>
				</Switch>
			</RoundContentContainer>
		</RoundContainer>
	);
}

const RoundContentContainer = styled.div`
	display: flex;
	flex-direction:column;
	flex: 1;
`;

const RoundContainer = styled.div`
	flex:1;
	display: flex;
	flex-direction: column;
`;

const ClockContainer = styled.div`
	text-align: center
`;

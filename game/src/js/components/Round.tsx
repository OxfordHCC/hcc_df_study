import React, { useState, useMemo, useEffect } from 'react';
import { RoundData, Answer, ButtonRoundData, RoundName } from 'dfs-common';
import { ButtonRound } from './ButtonRound';
import { Clock } from './Clock';
import { Switch, Case, DefaultCase } from './Switch';
import styled, {keyframes} from 'styled-components';


type OnAnswerPopup = {
	show: boolean
	correct: boolean;
}

type RoundParam = {
	round: number
	roundData: RoundData
	onAnswer: (answer: Answer) => void
	isBlue: boolean,
	onClockUpdate?: (a: string) => void
}
export function Round({ isBlue, roundData, round, onAnswer, onClockUpdate }: RoundParam): JSX.Element{
	const { name } = roundData;

	const [ doSlideOut, setDoSlideOut ] = useState<boolean>(false);
	
	console.log(doSlideOut);
	console.log("round data", roundData);

	useEffect(() => {
		setTimeout(() => {
			setDoSlideOut(false);
		}, 500)

		return () => {
			setDoSlideOut(true);
		}
	}, [round])

	function onAnswerWrap(answer: Answer){
		setDoSlideOut(true);
		onAnswer(answer);
	}

	return (
		<RoundContainer>
			<ClockContainer>
				<Clock
				onUpdate={onClockUpdate}
					start={roundData.startTime}
					length={roundData.msLength} />
			</ClockContainer>
			<RoundContentContainer out={doSlideOut}>
				<Switch<RoundName> on={name}>
					<Case when="button">
						<ButtonRound
							isBlue={isBlue}
							round={round}
							roundData={roundData as ButtonRoundData}
							onAnswer={onAnswerWrap}
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

const slideIn = keyframes`
from{
transform: translateX(100%);
}
to{
transform: translateX(0);
}
`;

const slideOut = keyframes`
from{
trasnform: translateX(0);
}
to{
transform: translateX(-100%);
}
`

type RoundContentContainerProps = {
	out: boolean;
}
const RoundContentContainer = styled.div<RoundContentContainerProps>`
	display: flex;
	flex-direction:column;
	flex: 1;
    animation: ${props => props.out? slideOut: slideIn} 0.5s forwards;
	transform: ${props => props.out? "translateX(0)" : "translateX(100%)" };
`;

const RoundContainer = styled.div`
	flex:1;
	display: flex;
	flex-direction: column;
`;

const ClockContainer = styled.div`
	height: 0;
	text-align: center
`;

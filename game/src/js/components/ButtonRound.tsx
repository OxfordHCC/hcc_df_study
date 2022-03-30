import React, { useMemo } from 'react';
import { ButtonRoundData, ButtonRoundAnswer } from 'dfs-common';
import styled from 'styled-components';
import { Spacer } from './Spacer';
import { Center } from './Center';
import { BombButton } from './BombButton';


export type ButtonRoundParams = {
	round: number
	roundData: ButtonRoundData
	onAnswer: (answer: ButtonRoundAnswer) => void
	isBlue: boolean
}

export function ButtonRound({ round, roundData, onAnswer, isBlue }: ButtonRoundParams): JSX.Element{
	const { solution } = roundData;

	const onButtonPress = (value: number) => onAnswer({ round, value });
	
	return (
		<Center>
			<Container>
				<InstructionsContainer>
					Press the correct button to defuse the bomb.
				</InstructionsContainer>
				<Spacer height="100px" />
				{
					(isBlue)
					? <BlueContainer>
						Press {solution}
					</BlueContainer>
					: <RedContainer>
						{
							roundData.options.map(option =>
								<BombButton key={option} onPress={onButtonPress} option={option}/>)
						}
					</RedContainer>
				}

			</Container >
		</Center>
	);
}

const BlueContainer = styled.div`
	text-align: center;
	font-size: 4vw;
`;
const Container = styled.div`
	width: 40vw;
	background: url("./textures/BROWNHUG.png");
	padding: 50px;
`;

const InstructionsContainer = styled.div`
	padding: 1vw;
	background: beige;
	text-align: center;
	font-size: 3vw;
`;

const RedContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;


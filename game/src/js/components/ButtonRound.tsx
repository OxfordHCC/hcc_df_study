import React, { useMemo } from 'react';
import { ButtonRoundData, ButtonRoundAnswer } from 'dfs-common';
import styled from 'styled-components';
import { Spacer } from './Spacer';
import { Center } from './Center';
import { BombButton } from './BombButton';
import { getEquation } from '../lib/equations';
import { EqInstructions } from './EqInstructions';


export type ButtonRoundParams = {
	round: number
	roundData: ButtonRoundData
	onAnswer: (answer: ButtonRoundAnswer) => void
	isBlue: boolean
}
export function ButtonRound({ round, roundData, onAnswer, isBlue }: ButtonRoundParams): JSX.Element {
	const onButtonPress = (value: number) => onAnswer({ round, value });
	const equation = useMemo(() => getEquation(round, roundData), [round]);

	return (
		<Center>
			<Container isBlue={isBlue}>
				{
					(isBlue === false)
					? <>
						<InstructionsContainer>Press the correct button to defuse the bomb.</InstructionsContainer>
						<Spacer height="100px" />
					</> : <></>
				}
				{
					(isBlue)
					? <BlueContainer>
						<EqInstructions roundData={roundData} equation={equation} />
					</BlueContainer>
					: <RedContainer>
						{
							roundData.options.map(option =>
								<BombButton key={option} onPress={onButtonPress} option={option} />)
						}
					</RedContainer>
				}
			</Container >
		</Center>
	);
}

const BlueContainer = styled.div`
	text-align: center;
	font-size: 1.5em;
`;

const Container = styled.div<{ isBlue: boolean }>`
border-bottom: 0.8vw solid;
border-left: 0.8vw solid rgb(122,33,33);
border-right: 0.8vw solid rgb(122,33,33);
border-top: 0.2vw solid brown;
width: ${props => props.isBlue ? "80vw" : "60vw"};
background: ${props => props.isBlue ? "beige" : 'url("./textures/BROWNHUG.png")'};
padding: 50px;
`;

const InstructionsContainer = styled.div`
	padding: 1vw;
	background: beige;
	text-align: center;
	font-size: 1.5em;
`;

const RedContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;


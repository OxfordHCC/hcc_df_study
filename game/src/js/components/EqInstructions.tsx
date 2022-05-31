import React from 'react';
import styled from 'styled-components';
import { RoundData } from 'dfs-common';
import { Equation } from '../lib/equations';
import { BombButton } from './BombButton';
import { Spacer } from './Spacer';


type ButtonSolutionProps = {
	label: string;
	value: number;
}
function ButtonSolution({value, label}: ButtonSolutionProps){
	return (
		<ButtonSolutionDiv>
			<span>{label}</span>
			<OptionColor onPress={() => {}} option={value}/>
		</ButtonSolutionDiv>
	);
}

export type EquationInstructionsProps = {
	equation: Equation;
	roundData: RoundData
}
export function EqInstructions({ equation, roundData }: EquationInstructionsProps) {
	const options = equation.options.map(x => x); // clone

	// place the correct options in the right index (to match the round data).
	const eqAnswerIndex = options.findIndex(x => x === equation.answer);
	const solutionIndex = roundData.solution as number;
	
	const temp = options[eqAnswerIndex];
	options[eqAnswerIndex] = options[solutionIndex];
	options[solutionIndex] = temp;

	return (
		<div >
			<div>
				{equation.label}
			</div>
			<Spacer height="50px" />
			<OptionsContainer>
				{
					options.map((label, indx) => <ButtonSolution key={indx} label={label} value={indx}/>
					)
				}
			</OptionsContainer>
		</div >
	)
}

const OptionColor = styled(BombButton)`
border: none;
color: white;
&:active {
boder: none;
}
`;

const OptionsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

const ButtonSolutionDiv = styled.div`
	display: flex;
	align-items: center;
`;

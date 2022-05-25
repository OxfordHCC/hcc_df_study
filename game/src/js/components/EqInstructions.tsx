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
	const buttonSolutions: [string, number][] =	equation.options.map((opt, i) => ([opt, i]));

	const a = buttonSolutions.find(([label, val]) => equation.answer === label);
	const b = buttonSolutions.find(([label, val]) => val === roundData.solution);

	const temp = a![1];
	a![1] = b![1];
	b![1] = temp;
	
	return (
		<div >
			<div>
				{equation.label}
			</div>
			<Spacer height="50px" />
			<OptionsContainer>
				{
					buttonSolutions.map(
						([label, value]) => <ButtonSolution key={value} label={label} value={value}/>
					)
				}
			</OptionsContainer>
		</div >
	)
}

const OptionColor = styled(BombButton)`
    border: 1px solid;
	border-radius: 20px;
    margin-left: 10px;
`;

const OptionsContainer = styled.div`
display: flex;
	justify-content: space-between;
`;

const ButtonSolutionDiv = styled.div`
	display: flex;
	align-items: center;
	margin: 0 30px;
`;

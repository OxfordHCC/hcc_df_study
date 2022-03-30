import React from 'react';
import { RoundData } from 'dfs-common';
import { Equation } from '../lib/equations';
import { BombButton } from './BombButton';

type ButtonSolutionProps = {
	label: string;
	value: number;
}
function ButtonSolution({value, label}: ButtonSolutionProps){
	return (
		<div>
			<span>{label}</span>
			<BombButton onPress={() => {}} option={value}/>
		</div>
	);
}

export type EquationInstructionsProps = {
	equation: Equation;
	roundData: RoundData
}
export function EqInstructions({ equation, roundData }: EquationInstructionsProps) {
	const buttonSolutions: [string, number][] = equation.options.map(
		(opt, i) => ([opt, i]));

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
			{
				buttonSolutions.map(
					([label, value]) => <ButtonSolution key={value} label={label} value={value}/>
				)
			}
		</div >
	)
}

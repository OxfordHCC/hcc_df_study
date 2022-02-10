import React from 'react';
import styled from 'styled-components';

const colorMap = [
	"yellow",
	"red",
	"blue",
	"green",
];

type BombButtonProps = {
	onPress: (value: number) => void
	option: number
}
export function BombButton({ onPress, option }: BombButtonProps) {
	const colorBlind = false;
	const color = colorMap[option];
	
	return (
		<Button color={color} onClick={() => onPress(option)}>
			{ colorBlind && option || "" }
		</Button>
	);

}

type ButtonProps = {
	color: string
}
const Button = styled.button<ButtonProps>`
	border: none;
	padding: 4vw;
	font-size: 4vw;
	background-color: ${p => p.color}
`;

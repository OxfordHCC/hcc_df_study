import React from 'react';
import styled from 'styled-components';

const colorMap = [
	"red",
	"blue",
	"green",
];

type BombButtonProps = {
	onPress: (value: number) => void
	option: number
	className?: string
}

export function BombButton({ onPress, option, className }: BombButtonProps) {
	const color = colorMap[option];
	
	return (
		<Button color={color} onClick={() => onPress(option)} className={className}>
			{ color.toUpperCase() }
		</Button>
	);

}

type ButtonProps = {
	color: string
}

const borderSize = "0.4vw"; // padding / 10 => 5% of width;
const Button = styled.button<ButtonProps>`
margin: 0 10px;
flex: 1;
color: white;
border: none;
padding: 0.3em 0.1em;
font-size: 4vw;
background-color: ${p => p.color};
border-bottom: ${borderSize} solid black;
border-left: ${borderSize} solid dark${p => p.color};
border-right: ${borderSize} solid dark${p => p.color};
border-top: ${borderSize} solid ${p => p.color};
&:active {
border-top: ${borderSize} solid;
border-bottom: ${borderSize} solid ${p => p.color};
}
`;

import React from 'react';
import styled from 'styled-components';
import { useState, useCallback, ChangeEvent } from 'react';
import { gotoRoute } from '../lib/router';
import { StoneScreen } from './StoneScreen';
import { Center } from './Center';



export function Home(): JSX.Element{
	const [playerId, setPlayerId] = useState("");
	
	const updatePlayerId = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setPlayerId(e.target.value);
		}, []);

	const onClick = useCallback(() => {
		gotoRoute("#game", { playerId });
	}, [playerId]);
	
	return (
		<StoneScreen>
			<Center style={{ flexDirection: "column" }}>
					<Form onSubmit={(e) => e.preventDefault()}>
						<label><h2>Enter your player ID:</h2></label>
						<Input name="id" type="text" value={playerId} onChange={updatePlayerId} />
						<Input type="submit" onClick={onClick} value="Submit" />
					</Form>
			</Center>
		</StoneScreen>
	);
}


const Form = styled.form`
	width: 70vw;
	height: 70vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	background: beige;
	border: 5px solid goldenrod;
`;

const Input = styled.input`
	margin: 10px auto;
	font-size: 1.5em;
`

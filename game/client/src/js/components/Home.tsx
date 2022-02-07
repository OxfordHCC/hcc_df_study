import React from 'react';
import { useState, useCallback, ChangeEvent } from 'react';
import { gotoRoute } from '../lib/router';
import { Screen } from './Screen';
import { Center } from './Center';

export function Home(): JSX.Element{
	const [playerId, setPlayerId] = useState("");

	const updatePlayerId = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setPlayerId(e.target.value);
		}, []);

	const onClick = useCallback(() => {
		gotoRoute("#game", { playerId });
	}, [playerId])
	
	return (
		<Screen>
			<Center style={{flexDirection: "column"}}>
				Enter your player id:
				<form onSubmit={(e) => e.preventDefault()}>
					<input type="text" value={playerId} onChange={updatePlayerId}/>
					<input type="submit" onClick={onClick} value="Submit"/>
				</form>
			</Center>
		</Screen>
	);
}

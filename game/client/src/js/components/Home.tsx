import React from 'react';
import { useState, useCallback, ChangeEvent } from 'react';
import { gotoRoute } from '../lib/router';
import { Screen } from './Screen';

export function Home(): JSX.Element{
	const [playerId, setPlayerId] = useState("");

	// we use callbacks here to memoize the function definition. We essentially tell
	// react that the updatePlayerId function will always be the same, on every render
	// of the Home component.
	const updatePlayerId = useCallback(function(e: ChangeEvent<HTMLInputElement>){
		setPlayerId(e.target.value);
	}, []);

	// similar use of usecallback as above, but we tell React that we want to "redefine"
	// the function each time playerId changes (note the second dependencies argument)
	const onClick = useCallback(() => {
		gotoRoute("#game", { playerId });
	},[playerId])
	
	return (
		<Screen>
			Enter your player id:
			<form onSubmit={(e) => e.preventDefault()}>
				<input type="text" value={playerId} onChange={updatePlayerId}/>
				<input type="submit" onClick={onClick} value="Submit"/>
			</form>
		</Screen>
	);
}

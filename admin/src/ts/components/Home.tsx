import React from 'react';
import { useCallback } from 'react';
import { goto } from '../lib/router';
import { GameList } from './GameList';

export function Home(){
	const goToCreateSession = useCallback(() => goto("#create_pair"), []);
	
	const goToRaw = useCallback(() => goto("#raw"), []);

	return (
		<div>
			<button onClick={goToCreateSession}>Create Session</button>
			<GameList/>
		</div>
	);
}

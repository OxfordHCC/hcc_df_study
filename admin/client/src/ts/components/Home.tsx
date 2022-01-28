import React from 'react';
import { useCallback } from 'react';
import { goto } from '../lib/router';
import { GameList } from './GameList';

// What should the home screen show?
// Participant pairs and their game session and mumble server status
// allow creation of pairs
// allow start/restart of games
// allow start/restart of mumble server
// view pairs -> view game, view mumble session, play recorded session;


export function Home(){
	const goToCreatePair = useCallback(() => goto("#create_pair"), []);
	
	//const goToCreateGame = useCallback(() => goto("#create_game"), []);
	const goToRaw = useCallback(() => goto("#raw"), []);

	return (
		<div>
			<button onClick={goToCreatePair}>Add participants</button>
			<GameList/>
		</div>
	);
}

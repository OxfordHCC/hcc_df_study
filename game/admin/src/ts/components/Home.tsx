import React from 'react';
import {  useCallback } from 'react';
import { goto } from '../lib/router';
import { GameList } from './GameList';

export function Home(){
	const goToCreateGame = useCallback(() => goto("#create_game"), []);
	const goToRaw = useCallback(() => goto("#raw"), []);
	return (
		<div>
			<button onClick={goToCreateGame}>Create game</button>
			<GameList/>
		</div>
	);
}

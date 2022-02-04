import React from 'react';
import { GameData } from 'dfs-common';
import { LobbyPlayerLI } from './LobbyPlayerLI';
import { Screen } from './Screen';

type GameLobbyParams = {
	gameState: GameData;
	playerId: string;
	onReadyChange: (flag: boolean) => void;
}

export function GameLobby({ playerId, gameState, onReadyChange }: GameLobbyParams): JSX.Element{
	const player = gameState.players.find(p => p.playerId === playerId);

	function toggleReady(){
		if(player === undefined){
			return
		}
		onReadyChange(!player.ready)
	}

	if (player === undefined) {
		return <p>Invalid game state: player missing from game.</p>
	}

	const listItems = gameState.players.map(p => {
		return <LobbyPlayerLI key={p.playerId} player={p} />
	});
	
	return (
		<Screen>
			{listItems}
			<button onClick={toggleReady}>{(player.ready === true) ? "Unready" : "Ready"}</button>
		</Screen>
	);
}

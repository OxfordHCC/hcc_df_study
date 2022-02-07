import React from 'react';
import { GameData } from 'dfs-common';
import { LobbyPlayerLI } from './LobbyPlayerLI';
import { Screen } from './Screen';
import { Center } from './Center';

type GameLobbyParams = {
	gameData: GameData;
	playerId: string;
	onReadyChange: (flag: boolean) => void;
}

export function GameLobby({ playerId, gameData, onReadyChange }: GameLobbyParams): JSX.Element{
	const player = gameData.players.find(p => p.playerId === playerId);

	function toggleReady(){
		if(player === undefined){
			return
		}
		onReadyChange(!player.ready)
	}

	if (player === undefined) {
		return <p>Invalid game state: player missing from game.</p>
	}

	const listItems = gameData.players.map(p => {
		return <LobbyPlayerLI key={p.playerId} player={p} />
	});
	
	return (
		<Screen>
			<Center style={{flexDirection: "column"}}>
				{listItems}
				<button onClick={toggleReady}>{(player.ready === true) ? "Unready" : "Ready"}</button>
			</Center>
		</Screen>
	);
}

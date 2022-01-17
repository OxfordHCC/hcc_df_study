import React from 'react';
import { GameState } from 'dfs-common';

const dateLocale = {
	year: 'numeric',
	month: 'short',
	day: 'numeric',
	minute: "numeric",
	hour: "numeric"
};

type GameListItemParams = {
	gameState: GameState
}
export function GameListRow({ gameState }: GameListItemParams){
	const blue = gameState.players[0];
	const red = gameState.players[1];

	const startDate = new Date(gameState.startTime);
	const startTimeLabel = startDate.toLocaleDateString("en-GB",
														dateLocale);

	return (
		<tr>
			<td>{gameState.gameId}</td>
			<td>{startTimeLabel}</td>
			<td>{gameState.rounds.length}</td>
			<td>{blue.playerId} ({blue.ready ? "R" : "N"})</td>
			<td>{red.playerId} ({red.ready ? "R" : "N"})</td>
		</tr>
	);
}



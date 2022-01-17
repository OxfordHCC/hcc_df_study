import React from 'react';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { GameState, deepClone } from 'dfs-common';
import { GameListRow } from './GameListRow';
import { onGame, offGame, getGames } from '../lib/game';


export function GameList() {
	const [games, setGames] = useState<GameState[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	console.log("GameList", games);

	useEffect(() => {
		async function populateGames(){
			// get games
			const newGames = await getGames();
			setGames(newGames);
			setLoading(false);
		}
		
		const onGamesUpdate = function(newGames){
			console.log("onGamesUpdate", newGames);
			setGames(deepClone(newGames));
		}

		onGame("games", onGamesUpdate);
		populateGames();
		
		return () => {
			offGame("games", onGamesUpdate);
		}
	}, []);

	if(loading){
		return <div>Loading...</div>
	}

	if(games.length === 0){
		return <div>No games</div>
	}
	
	return (
		<Gtable>
			<Gthead>
				<tr>
					<th>Game Id</th>
					<th>Start Time</th>
					<th>Current Round</th>
					<th>Blue</th>
					<th>Red</th>
				</tr>
			</Gthead>
			<tbody>
				{
					games.map(game =>
						<GameListRow key={game.gameId} gameState={game} />)
				}
			</tbody>
		</Gtable>
	);
}

const Gtable = styled.table`
	border: 1px solid pink;
	width: 100%;
	text-align: center;
	border-collapse: collapse;
	
	tbody tr:nth-child(odd) {
	  background-color: #ff33cc;
	}

	tbody tr:nth-child(even) {
	  background-color: #e495e4;
	}
	
	th, td{
	  padding: 10px;
	}
`;

const Gthead = styled.thead`

`;


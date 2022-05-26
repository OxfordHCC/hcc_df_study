import React from 'react';
import styled from 'styled-components';
import { GameData } from 'dfs-common';
import { LobbyPlayerLI } from './LobbyPlayerLI';
import { Screen } from './Screen';
import { Center } from './Center';


export type GameLobbyParams = {
	gameData: GameData;
	playerId: string;
	onReadyChange: (flag: boolean) => void;
}


function RedLobbyInstructions(){
	return <div>
		You are <span>RED</span>!
		Your task is to listen to your team-mates instructions and press the correct button. There are multiple rounds, you need to do this for each round.
	</div>
}

function BlueLobbyInstructions(){
	return <div>
		<div>You are <span>BLUE</span>!</div>
		<div>
			Your task is to find the correct color and communicate it to your team-mate. There will be multiple rounds, you need to do this for each round.
		</div>
	</div>
}

export function GameLobby({ playerId, gameData, onReadyChange }: GameLobbyParams): JSX.Element{
	const player = gameData.players.find(p => p.playerId === playerId);

	const [blue, red] = gameData.players;
	const isBlue = playerId === blue.playerId;
	
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
				<InstructionsContainer>
					{
						(isBlue)
						? <BlueLobbyInstructions/>
						: <RedLobbyInstructions/>
					}
					<div>When you're ready, please press the READY button.</div>
				</InstructionsContainer>
				{listItems}
				<button onClick={toggleReady}>{(player.ready === true) ? "Unready" : "Ready"}</button>
			</Center>
		</Screen>
	);
}


const InstructionsDiv = styled.div`
	
`;

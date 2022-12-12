import React from 'react';
import styled from 'styled-components';
import { GameData } from 'dfs-common';
import { LobbyPlayerLI } from './LobbyPlayerLI';
import { StoneScreen } from './StoneScreen';
import { Center } from './Center';
import { Spacer } from './Spacer';


export type GameLobbyParams = {
	gameData: GameData;
	playerId: string;
	onReadyChange: (flag: boolean) => void;
}

function RedLobbyInstructions(){
	return <div>
		Your task is to <strong>listen</strong> to your team-mates instructions <strong>and press the correct button</strong>. There are multiple rounds, you need to do this for each round.
	</div>
}

function BlueLobbyInstructions(){
	return <div>
		Your task is to <strong>find the correct color</strong> and communicate it to your team-mate. There will be multiple rounds, you need to do this for each round.
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
		<StoneScreen>
			<Center style={{ flexDirection: "column" }}>
				<Container>
					<div>
						<h1>You are {
							(isBlue)
							? <ColorSpan color="blue">BLUE</ColorSpan>
							: <ColorSpan color="red">RED</ColorSpan>
						}!</h1>
					</div>
					<InstructionsContainer>
						{
							(isBlue)
								? <BlueLobbyInstructions />
								: <RedLobbyInstructions />
						}
						<Spacer height="5vh"/>
						<div>For detailed instructions on the game, please click the following <a href="https://docs.google.com/document/d/1gZoliNJS8Oj21dPFiekFg0aboQnWKLgN/edit?usp=sharing&ouid=112740454555108283105&rtpof=true&sd=true"><u>link</u></a>.</div>
						<Spacer height="5vh"/>
						<div>When you're ready, please press the <Button disabled>READY</Button> button.</div>
					</InstructionsContainer>
					<div>
						<PlayerContainer>
							{listItems}
						</PlayerContainer>
						<button onClick={toggleReady}>
							{
								(player.ready === true) ? "Unready" : "Ready"
							}
						</button>
					</div>
				</Container>
			</Center>
		</StoneScreen>
	);
}

const PlayerContainer = styled.div`
	margin: 20px auto;
`;

const InstructionsContainer = styled.div`
	text-align: initial;
	margin: 0 10vw;
`;

const Container = styled.div`
	text-align: center;
    width: 70vw;
    height: 70vh;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    background: beige;
    border: 5px solid goldenrod;
`;

const ColorSpan = styled.span`
	color: ${props => props.color};
	border: 3px solid ${props => props.color};
	padding: 0.1em;
`
// plain button for now...
const Button = styled.button``;

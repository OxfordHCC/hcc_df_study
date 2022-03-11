import React, {useEffect, useState} from 'react';
import { GameScreen } from './GameScreen';
import { SessionData } from 'dfs-common';
import { SessionClient } from '../lib/session';


type SessionScreenProps = {
	playerId: string
}

type SessionScreenState = {
	loading: boolean
	currentGame?: number
}
export function SessionScreen({ playerId }: SessionScreenProps){
	const [ sessionScreenState, setSessionScreenState] = useState<SessionScreenState>({
		loading: true
	});

	useEffect(() => {
		
		function onSessionState({ currentGame }: SessionData){
			setSessionScreenState({
				loading: false,
				currentGame
			});
		}

		const session = new SessionClient(playerId);
		session.on("state", onSessionState);
		session.connect();

		// clean-up 
		return () => {
			session.off('state', onSessionState);
		}
	}, [playerId]);

	const { loading, currentGameId } = sessionScreenState;

	if (loading){
		return <p>Loading session screen</p>;
	}
	
	if (currentGameId === undefined){
		return <p>Error: session has no current game.</p>
	}
	
	return <GameScreen playerId={playerId} gameId={currentGameId}/>
}

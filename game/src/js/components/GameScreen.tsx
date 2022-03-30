import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { GameClient } from '../lib/game';
import { GameLobby } from './LobbyScreen';
import { GameReview } from './ReviewScreen';
import { RoundScreen } from './RoundScreen';
import { Answer, GameData } from 'dfs-common';


type GameScreenProps = {
	playerId: string
}

export function GameScreen({ playerId } : GameScreenProps): JSX.Element{
	const [loading, setLoading] = useState<boolean>(true);
	const [gameData, setGameState] = useState<GameData>();
	const [popup, setPopup] = useState<OnAnswerPopup>({
		show: false,
		correct: true
	});

	const game = useMemo(
		() => new GameClient({ playerId }), [playerId]
	);

	useEffect(() => {
		// whenever we show pop-up, register a timeout callback
		// to hide it immediately
		if (popup.show === true) {
			const timeout = setTimeout(() => {
			}, 1000);
			return () => {
				clearTimeout(timeout);
			}
		}
	}, [popup.show]);
	
	useEffect(() => {
		const onConnect = function() {
			setLoading(false);
		}

		const onState = function(state: GameData){
			setGameState(state);
		}
		
		const onError = function(error: Error){
			setLoading(false);
			alert(error);
		}

		const onDisconnect = function(){
			setGameState(undefined);
		}
	
		game.on("error", onError);
		game.on("connect", onConnect);
		game.on("disconnect", onDisconnect);
		game.on("state", onState);

		game.connect();

		return () => {
			game.disconnect();
			game.off("state", onState);
			game.off("error", onError);
			game.off("connect", onConnect);
		};
	}, [game]);


	function onPlayerReadyChange(val: boolean){
		game.setReady(val);
	}

	function onAnswer(answer: Answer) {
		//check answer, set
		setPopup({
			...popup,
			show: true
		});
		game.answer(answer);
	}

	if (loading) {
		return <p>Loading</p>;
	}

	if(gameData === undefined){
		return <p>Game not found</p>;
	}

	const { startTime, endTime } = gameData;

	if (startTime === undefined) {
		return <GameLobby
			playerId={playerId}
			gameData={gameData}
			onReadyChange={onPlayerReadyChange} />;
	}

	if (endTime !== undefined) {
		return <GameReview gameData={gameData} />;
	}
 
	return <RoundScreen
			   gameData={gameData}
			   playerId={playerId}
			   onAnswer={onAnswer}/>;
}

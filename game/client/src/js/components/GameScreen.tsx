import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { GameClient } from '../lib/game';
import { GameLobby } from './GameLobby';
import { GameReview } from './GameReview';
import { GameRound } from './GameRound';
import { Screen } from './Screen';
import { GameData } from 'dfs-common';


type GameScreenProps = {
	playerId: string
}

export function GameScreen({ playerId } : GameScreenProps): JSX.Element{
	const [loading, setLoading] = useState<boolean>(true);
	const [gameState, setGameState] = useState<GameData>();
	
	const game = useMemo(() => new GameClient({ playerId }), [ playerId ]);

	function onAnswerGame(option: number, round: number) {
		game.answer({ option, round });
	}

	useEffect(() => {
		const onConnect = function(){
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
	}, [playerId]);


	function onPlayerReadyChange(val: boolean){
		game.setReady(val);
	}
	
	if(loading){
		return <p>Loading</p>;
	}

	if(gameState === undefined){
		return <p>Game not found</p>;
	}

	if (gameState.startTime === undefined) {
		return <GameLobby
				   playerId={playerId}
				   gameState={gameState}
				   onReadyChange={onPlayerReadyChange} />;
	}

	if (gameState.endTime !== undefined){
		return <GameReview gameState={gameState} />;
	}

	const lastRound = gameState.rounds[gameState.rounds.length - 1];

	const score = (gameState.rounds).map(round => {
		return round.answer !== undefined
			&& round.answer === round.solution
			 ? 1 : 0
	}).reduce((acc: number, curr) => acc + curr, 0);

	// game is in progress, show round
	return (
		<Screen>
			<h3>Round {}</h3>
			<div>Bombs defused: {score}</div>
			<div>Blue: {gameState.players[0].playerId}</div>
			<div>Red: {gameState.players[1].playerId}</div>
			<GameRound round={lastRound} onAnswer={onAnswerGame} />
		</Screen>
	);
}


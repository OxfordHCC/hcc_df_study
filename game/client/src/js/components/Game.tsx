import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { ClientGameState } from 'dfs-common';
import { GameClient } from '../lib/game';
import { GameLobby } from './GameLobby';
import { GameReview } from './GameReview';
import { GameRound } from './GameRound';
import { Screen } from './Screen';

type GameProps = {
	playerId: string
}

export function GamePage({ playerId } : GameProps): JSX.Element{
	const [loading, setLoading] = useState<boolean>(true);
	const [gameState, setGameState] = useState<ClientGameState>();

	const game = useMemo(() => new GameClient({ playerId }), [playerId]);

	function onAnswerGame(option: number, round: number){
		game.answer({option, round});
	}

	useEffect(() => {
		const onConnect = function(){
			setLoading(false);
		}

		const onState = function(state: ClientGameState){
			console.log('state is ', state);
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
		return <p>Game not found</p>
	}

	// game did not start yet... show lobby
	if (gameState.startTime === undefined) {
		return <GameLobby playerId={playerId} gameState={gameState}
			onReadyChange={onPlayerReadyChange} />
	}

	const lastRound = gameState.rounds[gameState.rounds.length - 1];
	const timeSinceLastRound = Date.now() - lastRound.startTime;

	// game is finished, show results
	if (lastRound.answer !== undefined || timeSinceLastRound > gameState.msRoundLength) {
		return <GameReview gameState={gameState} />
	}

	const score = (gameState.rounds)
		.map(round => (
			round.answer !== undefined
			&& round.answer === round.task.correctOption? 1 : 0 ))
		.reduce((acc: number, curr) => acc + curr, 0);
	
	// game is in progress, show round
	return (
		<Screen>
			<h3>Round {lastRound.roundNumber}</h3>
			<div>Bombs defused: {score}</div>
			<div>Blue: {gameState.players[0].playerId}</div>
			<div>Red: {gameState.players[1].playerId}</div>
			<GameRound round={lastRound} onAnswer={onAnswerGame}/>
		</Screen>
	);
}


import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { GameClient } from '../lib/game';
import { GameLobby } from './GameLobby';
import { GameReview } from './GameReview';
import { GameRound } from './GameRound';
import { Screen } from './Screen';
import { Answer, GameData } from 'dfs-common';


type GameScreenProps = {
	playerId: string
}

export function GameScreen({ playerId } : GameScreenProps): JSX.Element{
	const [loading, setLoading] = useState<boolean>(true);
	const [gameState, setGameState] = useState<GameData>();

	const game = useMemo(() => new GameClient({ playerId }), [ playerId ]);

	function onAnswerGame(answer: Answer) {
		game.answer(answer);
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

	const {
		rounds, startTime, endTime, players, currentRound
	} = gameState;

	const isBlue = playerId === players[0].playerId;
	const currRoundData = rounds[currentRound];

	if (startTime === undefined) {
		return <GameLobby
			playerId={playerId}
			gameState={gameState}
			onReadyChange={onPlayerReadyChange}/>;
	}

	if (endTime !== undefined){
		return <GameReview gameData={gameState} />;
	}
	
	const score = rounds.map(round => {
		return round.answer !== undefined
			&& round.answer === round.solution
			 ? 1 : 0
	}).reduce((acc: number, curr) => acc + curr, 0);

	const total = rounds
		.map(r => (r.answer !== undefined)? 1 : 0)
		.reduce((acc: number, curr) => acc + curr, 0);

	// game is in progress, show round
	return (
		<Screen>
			<h3>Round {currentRound}</h3>
			<div>Score: {score}/{total}</div>
			<div>Blue: {players[0].playerId}</div>
			<div>Red: {players[1].playerId}</div>
			<GameRound round={currentRound}
				roundData={currRoundData}
				onAnswer={onAnswerGame}
				isBlue={isBlue} />
		</Screen>
	);
}


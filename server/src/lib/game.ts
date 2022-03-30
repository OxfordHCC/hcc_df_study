import crypto from 'crypto';
import { List, Either, Left, Right } from 'monet';
import { parallel, FutureInstance, map, chain, fork } from 'fluture';
import { aoe2ea, e2f } from './util';

import {
	Evented,
	GameEvents,
	Player,
	Answer,
	GameData,
	ConcreteRoundData,
} from 'dfs-common';
import { withDb } from './db';
import { createPlayer } from './player';
import { Round, createRound } from './round';
import { Logger } from './log';

const { log, error } = Logger("gamelib");

const memGames:Game[] = [];

type GameRow = {
	gameId: string;
	sessionId: number;
	gameData: GameData;
	isCurrent: boolean;
	gameOrder: number;
}

export function initGameRows(gRows: GameRow[]) {
	return aoe2ea(
		gRows.sort((a, b) => a.gameOrder - b.gameOrder)
		.map(gRow => gRow.gameData)
		.map(initGame))
}

export const gameSchedules: ConcreteRoundData[][] = [
	[
		{
			name: "button",
			solution: 1,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		}
	],
	[
		{
			name: "button",
			solution: 1,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		},
		{
			name: "button",
			solution: 2,
			msLength: 10000,
			options: [0, 1, 2, 3]
		}
	]
];

const gameTimers: {
	[index: string]: NodeJS.Timeout
} = {};

function scheduleTimer(gameId: string, cb: () => void, ms: number){
	if(gameTimers[gameId] !== undefined){
		clearTimeout(gameTimers[gameId]);
	}
	gameTimers[gameId] = setTimeout(cb, ms);
}

function getTimer(gameId: string){
	return gameTimers[gameId];
}

type GameParams = Omit<GameData, "rounds" | "currentRound"> & {
	currentRound?: number
	rounds: Round[]
}
export class Game extends Evented<keyof GameEvents> implements GameData{
	players: Player[]
	gameId: string
	rounds: Round[]
	currentRound: number
	startTime?: number
	endTime?: number
	
	constructor({ gameId, players, rounds, currentRound, startTime }: GameParams){
		super();
		
		this.currentRound = currentRound || 0;
		this.rounds = rounds;
		this.gameId = gameId;
		this.players = players;
		this.startTime = startTime;
		
		this.on("player_ready", () =>
			this.startIfPlayersReady());
		
		this.on("state", () => fork((err) => {
			error("error saving game", JSON.stringify(err));
		}) ((x) => {
			log("saved game", JSON.stringify(this));
		})(saveGame(this)));

		this.on("player_ready", () => this.trigger("state"));
		this.on("answer", () => this.trigger("state"));
		this.on("stop",	() => this.trigger("state"));
		this.on("start", ()	=> this.trigger("state"));
		this.on("round", ()	=> this.trigger("state"));
	}

	state(){
		return JSON.parse(JSON.stringify(this)) as GameData;
	}

	answer(answer: Answer): Either<Error, number>{
		const { round } = answer;
		const roundObj = this.rounds[round];

		if (roundObj === undefined) {
			return Left(new Error("invalid round number"));
		}

		if (roundObj.endTime !== undefined) {
			return Left(new Error("round ended"));
		}
		
		if (roundObj.startTime === undefined){
			return Left(new Error("round not started"));
		}
		
		clearTimeout(getTimer(this.gameId));
		
		this.trigger("answer", answer);

		// update round
		const answerStatus = roundObj.onAnswer(answer);

		if (answerStatus !== 0) {
			this.gotoRound(round + 1);
		}
		
		return Right(answerStatus);
	}

	gotoRound(round: number): Either<Error, Game> {
		this.currentRound = round;

		const roundObj: Round = this.rounds[round];
		if (roundObj === undefined) {
			this.stop();
			return Left(new Error("round does not exit"));
		}
		
		roundObj.startTime = Date.now();
		
		this.trigger("round", { round });

		scheduleTimer(this.gameId, () => {
			this.gotoRound(round + 1);
		}, roundObj.msLength);

		return Right(this);
	}

	start(): boolean{
		this.startTime = Date.now();
		this.gotoRound(0);
		this.trigger("start", this);
		return true;
	}

	stop(){
		this.endTime = Date.now();
		this.trigger("stop");
	}

	playerReady(
		playerId: string, ready: boolean
	): Either<Error, Game>{
		const player = this.players.find(p => p.playerId === playerId);
		
		if(!player){
			return Left(new Error("Player not found in game."));
		}
	
		player.ready = ready;
		this.trigger("player_ready", player);
		return Right(this);
	}
	
	startIfPlayersReady(): boolean {
		if(this.startTime !== undefined){
			return false;
		}
		
		const [blue, red] = this.players;
		
		if (blue.ready !== true) {
			return false;
		}

		if (red.ready !== true) {
			return false;
		}

		return this.start();
	}
}

export function isGame(x: any): x is Game{
	return x instanceof Game;
}

function resumeGame(game: Game): Game{
	if(game.startTime !== undefined){
		game.gotoRound(game.currentRound);
	}
	return game;
}

export function deserializeGame(gameData: GameData): Either<Error, Game>{
	const roundsE = List.fromArray(gameData.rounds.map(createRound));

	return roundsE.sequence<Error, Round>(Either)
	.map(roundsL => roundsL.toArray())
	.map(rounds => new Game({ ...gameData, rounds }))
	.map(resumeGame);
}

const updateGameQuery = `
UPDATE game
SET game_data = $game_data
WHERE game_id = $game_id;
`;
// persist game state
function saveGame(game: Game): FutureInstance<Error, Game>{
	log("saveGame", game.gameId);
	const gameData = game.state();

	return withDb(({run}) => {
		return run(updateGameQuery, {
			$game_id: game.gameId,
			$game_data: JSON.stringify(gameData)
		});
	})
	.pipe(map(_gameId => game));
}

function removeMemGame(game: Game): Game{
	const memindx = memGames.findIndex(mg => mg.gameId === game.gameId);
	memGames.splice(memindx, 1);
	
	return game;
}

function setMemGame(game: Game): Game{
	const memIndx = memGames.findIndex(mg => mg.gameId === game.gameId);
 	if (memIndx !== -1) {
 		memGames[memIndx] = game;
 		return game;
 	}
 	
 	memGames.push(game);
	return game;
}

const deleteGameQuery = `
DELETE FROM game
WHERE game_id = $game_id;
n`;
export function removeGame(game: Game): FutureInstance<Error, Game> {
	const { gameId } = game;

	log("removeGame", gameId)
	
	return withDb(({run}) => {
		return run(deleteGameQuery, {
			$game_id: gameId
		});
	})
	.pipe(map(_ => game))
	.pipe(map(removeMemGame));
}

export function getGames(): Game[] {
	return memGames;
}

export function getPlayerGame(playerId: string): Either<Error, Game> {
	const game = memGames.find(({ players})	=>
		players.find(p => p.playerId === playerId) !== undefined
	);

	if(game === undefined){
		return Left(new Error("No game found for player."));
	}
	
	return Right(game);
}

export function getGame(gameId: string): Either<Error, Game> {
	const game = memGames.find(g => g.gameId === gameId);
	if(game === undefined){
		return Left(new Error("Game not found."));
	}
	
	return Right(game);
}

// insert game in table and create in-memory representation
const insertGameQuery = `
INSERT INTO game
(game_id, game_data, is_current, session_id, game_order)
VALUES ($game_id, $game_data, $is_current, $session_id, $game_order);
`;

function insertGame(
	{ gameId, gameData, sessionId, isCurrent, gameOrder }: GameRow
): FutureInstance<Error, number>{
	return withDb(({run}) => {
		return run(insertGameQuery, {
			$game_id: gameId,
			$game_data: JSON.stringify(gameData),
			$session_id: sessionId,
			$is_current: isCurrent,
			$game_order: gameOrder
		})
	})
}

export function createGame(
	blue: string, red: string, sessionId: number, gameOrder: number,
	schedule: ConcreteRoundData[], isCurrent: boolean
): FutureInstance<Error, Game> {
	log("createGame", sessionId, blue, red);
	const gameId = crypto.randomUUID();
	const players = [blue, red].map<Player>(createPlayer);
	const game = List.fromArray(schedule.map(createRound))
	.sequenceEither<Error, Round>()
	.map(roundsL => roundsL.toArray())
	.map(rounds => new Game({ gameId, players, rounds }));

	return e2f(game)
	.pipe(chain(game => insertGame({
		gameData: game.state(),
		gameId: game.gameId,
		sessionId,
		isCurrent,
		gameOrder
	})))
	.pipe(chain(_gameId => e2f(game)));
}

function parseJSON<T>(arg: string): Either<Error, T>{
	try{
		return Right(JSON.parse(arg));
	}catch(err){
		if (err instanceof Error) {
			if (err instanceof SyntaxError) {
				return Left(new Error(err.message + "\nInput:" + arg));
			}
			return Left(err);
		}
		return Left(new Error("Unknown error thrown by JSON.parse"));
	}
}

const getSessionGamesQuery = `
SELECT * FROM game
WHERE session_id = $session_id;
`;

function normalizeGameRow(db_game: any): Either<Error, GameRow>{
	return parseJSON<GameData>(db_game.game_data)
	.map((gameData) => ({
		gameId: db_game.game_id,
		gameData: gameData,
		sessionId: db_game.session_id,
		isCurrent: Boolean(db_game.is_current),
		gameOrder: parseInt(db_game.game_order)
	}));
}
export function getSessionGames(sessionId: number): FutureInstance<Error, GameRow[]>{
	return withDb(({ all }) =>
		all(getSessionGamesQuery, {
			$session_id: sessionId
		})
	)
	.pipe(map(rows => rows.map(normalizeGameRow)))
	.pipe(map(rowsE => rowsE.map(e2f)))
	.pipe(chain(rowsF => parallel(1)(rowsF)))
}

export function initGame(gameData: GameData): Either<Error, Game>{
	log("initGame", gameData.gameId, gameData.currentRound);
	return deserializeGame(gameData)
	.map(setMemGame);
}


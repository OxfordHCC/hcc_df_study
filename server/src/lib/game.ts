import crypto from 'crypto';
import { List, Either, Left, Right } from 'monet';
import { mapRej, parallel, FutureInstance, map, chain, fork } from 'fluture';
import { aoe2ea, e2f } from './util';

import {
	Session,
	Evented,
	GameEvents,
	Player,
	Answer,
	GameData,
	ConcreteRoundData,
} from 'dfs-common';
import { createAttack } from './attacklib';
import { withDb } from './db';
import { createPlayer } from './player';
import { Round, createRound } from './round';
import { Logger } from './log';

const { log, error } = Logger("gamelib");

const memGames:Game[] = [];

export type GameRow = {
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
		}) (() => {
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
			// introduce delay between going to next round
			// this minimizes the chances of latency causing the
			// attack (which is now async) to trigger before 
			setTimeout(() => {
				this.gotoRound(round + 1);
			}, 1000)
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
			// on timeout, answer current round with undefined answer
			this.answer({ round });
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
WHERE game_id = $game_id`;
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


export function getGame(gameId: string): Either<Error, Game> {
	const game = memGames.find(g => g.gameId === gameId);
	if(game === undefined){
		return Left(new Error("Game not found."));
	}
	
	return Right(game);
}

// insert game in db
const insertGameQuery = `
INSERT INTO game
(game_id, game_data, is_current, session_id, game_order)
VALUES ($game_id, $game_data, $is_current, $session_id, $game_order);
`;

function insertGame(
	params: GameRow
): FutureInstance<Error, GameRow>{
	const { gameId, gameData, sessionId, isCurrent, gameOrder } = params;
	return withDb(({ run }) => {
		return run(insertGameQuery, {
			$game_id: gameId,
			$game_data: JSON.stringify(gameData),
			$session_id: sessionId,
			$is_current: isCurrent,
			$game_order: gameOrder
		})
	})
	.pipe(map(_ => params));
}

export function createGameAttacks(schedule: ConcreteRoundData[]) {
	return function(gameRow: GameRow): FutureInstance<Error, GameRow> {
		return parallel(1)(
			schedule.map((roundData, roundIndex) => ({
				...roundData,
				roundIndex
			}))
			.filter(roundData => roundData.hasOwnProperty('attack'))
			.map(roundData => createAttack({
				gameRow,
				attackSolution: roundData.attack,
				roundIndex: roundData.roundIndex
		})))
		.pipe(map(_x => gameRow));
	}
}

export function createGame(
	blue: string, red: string, sessionId: number, gameOrder: number,
	schedule: ConcreteRoundData[], isCurrent: boolean
): FutureInstance<Error, GameRow> {
	log("createGame", sessionId, blue, red);
	const gameId = crypto.randomUUID();
	const players = [blue, red].map<Player>(createPlayer);

	return e2f(aoe2ea(schedule.map(createRound)))
	.pipe(map(rounds => new Game({gameId, players, rounds})))
	.pipe(chain(game => insertGame({
		gameData: game.state(),
		gameId,
		sessionId,
		isCurrent,
		gameOrder
	})))
	.pipe(chain(createGameAttacks(schedule)));
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

export function removeSessionGames(session: Session): FutureInstance<Error, Session>{
	const { sessionId } = session;
	log('remove_session_games', sessionId);

	return getSessionGames(sessionId)
	.pipe(map(gameRows => gameRows.map(g => getGame(g.gameId))))
	.pipe(map(x => aoe2ea(x))) // Array<Either> to Either<Array>
	.pipe(chain(x => e2f(x)))  // either to future
	.pipe(map(games => games.map(removeGame)))
	.pipe(chain(parallel(1))) // combine futures
	.pipe(map(_ => session))
	.pipe(mapRej(err => {
		error("remove_session_games", err.message);
		return err;
	}))
}

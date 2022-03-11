import crypto from 'crypto';
import {
	Either,
	Evented,
	GameEvents,
	Player,
	Answer,
	GameData,
	ConcreteRoundData,
	joinErrors,
	isError,
	isGameData
} from 'dfs-common';
import { withDb } from './db';
import { createPlayer } from './player';
import { Round, createRound, isRound } from './round';
import { Logger } from './log';

const { log } = Logger("gamelib");

const memGames:Game[] = [];

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
		
		this.on("state", () => saveGame(this));
		this.on('state', () => log("state", JSON.stringify(this)));
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
			return new Error("invalid round number");
		}

		if (roundObj.endTime !== undefined) {
			return new Error("round ended");
		}
		
		if (roundObj.startTime === undefined){
			return new Error("round not started");
		}
		
		clearTimeout(getTimer(this.gameId));
		
		this.trigger("answer", answer);

		// update round
		const answerStatus = roundObj.onAnswer(answer);

		if (answerStatus !== 0) {
			this.gotoRound(round + 1);
		}
		
		return answerStatus
	}

	gotoRound(round: number): Either<void, Error> {
		this.currentRound = round;

		const roundObj: Round = this.rounds[round];
		if (roundObj === undefined) {
			this.stop();
			return new Error("round does not exit")
		}
		
		roundObj.startTime = Date.now();
		
		this.trigger("round", { round });

		scheduleTimer(this.gameId, () => {
			this.gotoRound(round + 1);
		}, roundObj.msLength);
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

	playerReady(playerId: string, ready: boolean)
	: Either<Error, undefined>{
		const player = this.players.find(p => p.playerId === playerId);
		
		if(!player){
			return new Error("Player not found in game.");
		}
	
		player.ready = ready;
		this.trigger("player_ready", player);
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

export function deserializeGame(gameData: GameData) {
	const roundsEither = gameData.rounds.map(createRound);
	const rounds = roundsEither.filter(isRound);
	const game = new Game({
		...gameData,
		rounds
	});

	// resume game
	if(game.startTime !== undefined){
		game.gotoRound(game.currentRound);
	}
	
	return game;	
}

const updateGameQuery = `
UPDATE game
SET game_data = $game_data
WHERE game_id = $game_id;
`;
// persist game state
function saveGame(game: Game){
	log("saveGame", game.gameId);
	const gameData = game.state();

	return withDb(db => {
		db.run(updateGameQuery, {
			$game_id: game.gameId,
			$game_data: JSON.stringify(gameData)
		});
	});
}

const deleteGameQuery = `
DELETE FROM game
WHERE game_id = $game_id;
`;
export async function removeGame(gameId: string | Game) {
	if (gameId instanceof Game){
		gameId = gameId.gameId;
	}
	log("removeGame", gameId)

	await withDb(db => {
		new Promise((resolve, reject) => {
			db.run(deleteGameQuery, {
				$game_id: gameId
			}, (err) => {
				if(err){
					return reject(err);
				}
				resolve(null);
			});
		})
	});

	const memindx = memGames.findIndex(mg => mg.gameId === gameId);
	memGames.splice(memindx, 1);
	return memGames.length;
}

export function getGames(): Game[] {
	return memGames;
}

export function getPlayerGame(playerId: string): Either<Error, Game> {
	const game = memGames.find(({ players})	=>
		players.find(p => p.playerId === playerId) !== undefined
	);

	if(game === undefined){
		return new Error("No game found for player.");
	}
	
	return game;
}

export function getGame(gameId: string): Either<Error, Game> {
	const game = memGames.find(g => g.gameId === gameId);
	if(game === undefined){
		return new Error("Game not found.");
	}
	
	return game;
}

// insert game in table and create in-memory representation
const insertGameQuery = `
INSERT INTO game
(game_id, game_data, is_current, session_id)
VALUES ($game_id, $game_data, $is_current, $session_id);
`;
export async function createGame(
	blue: string, red: string, sessionId: number,
	schedule: ConcreteRoundData[], isCurrent: boolean
): Promise<Either<Error, GameData>>{
	log("createGame", sessionId, blue, red);
	const gameId = crypto.randomUUID();
	const players = [blue, red].map<Player>(createPlayer);
	const createdRounds = schedule.map(createRound);
	const errorRounds = createdRounds.filter(isError);

	if(errorRounds.length > 0){
		return new Error(errorRounds.map(err => err.message).join('\n'));
	}
	
	const rounds = createdRounds.filter(isRound);
	const game = new Game({
		gameId,
		players,
		rounds
	});
	const gameData = game.state();

	// insert game into database
	await withDb((db) => {
		return new Promise((resolve, reject) => {
			db.run(insertGameQuery, {
				$game_id: gameId,
				$game_data: JSON.stringify(gameData),
				$session_id: sessionId,
				$is_current: isCurrent,
			}, function(err){
				if(err){
					return reject(err);
				}
				const sessionId = this.lastID;
				resolve(null);
			});
		});
	});

	return gameData;
}

function parseJSON(arg: string){
	try{
		return JSON.parse(arg);
	}catch(err){
		if(err instanceof SyntaxError){
			return new Error(err.message + "\nInput:" + arg);
		}

		return err;
	}
}

const getSessionGamesQuery = `
SELECT * FROM game
WHERE session_id = $session_id;
`;
type GameRow = {
	gameId: string;
	sessionId: number;
	gameData: GameData;
	isCurrent: boolean;
}
function isGameRow(x: any): x is GameRow{
	return typeof x.gameId === "string"
		&& typeof x.sessionId === "number"
		&& isGameData(x.gameData)
		&& typeof x.isCurrent === "boolean";
}
function normalizeGameRow(db_game: any): Either<Error, GameRow>{
	const gameData = parseJSON(db_game.game_data);
	if(gameData instanceof Error){
		return gameData;
	}
	
	return {
		gameId: db_game.game_id,
		gameData: gameData,
		sessionId: db_game.session_id,
		isCurrent: Boolean(db_game.is_current)
	}
}
export function getSessionGames(sessionId: number): Promise<Either<Error, GameRow[]>>{
	return withDb(db => {
		return new Promise((resolve, reject) => {
			db.all(getSessionGamesQuery, {
				$session_id: sessionId
			}, (err, rows) => {
				if(err){
					return reject(err);
				}
				const normalized = rows.map(normalizeGameRow);
				const errors = normalized.filter(isError);
				const gameRows = normalized.filter(isGameRow);
				
				if(errors.length > 0){
					return reject(joinErrors(errors));
				}
				resolve(gameRows);
			});
		});
	});
}

export function initGame(gameData: GameData): Game{
	log("initGame", gameData.gameId, gameData.currentRound);
	const game = deserializeGame(gameData);
	// if game with same id is already cached, we simply replace it
	const memIndx = memGames.findIndex(mg => mg.gameId === game.gameId);
 	if (memIndx !== -1) {
 		memGames[memIndx] = game;
 		return game;
 	}
 	
 	memGames.push(game);
 	return game;
}

import { Either, splitOf } from './fp';
import {
	Evented,
	GameEvents,
	Player,
	Answer,
	GameData
} from 'dfs-common';

import { Round, createRound } from './round';

const memGames:Game[] = [];

const gameTimers: {
	[index:string]: NodeJS.Timeout
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

type GameParams = Omit<GameData, "currentRound"> & {
	rounds: Round[]
}
export class Game extends Evented<keyof GameEvents> implements GameData{
	players: Player[]
	gameId: string
	rounds: Round[]
	currentRound: number
	startTime?: number
	endTime?: number
	
	constructor({ gameId, players, rounds }: GameParams){
		super();

		this.currentRound = 0;
		this.rounds = rounds;
		this.gameId = gameId;
		this.players = players
		
		this.on("player_ready", () =>
			this.startIfPlayersReady());
		this.on("player_ready", () => this.trigger("state"));
		this.on("answer", () =>	this.trigger("state"));
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
			return new Error("Player not found in game.")
		}
	
		player.ready = ready;
		this.trigger("player_ready", player);
	}

	
	startIfPlayersReady(): boolean {
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

export function getGames(): Game[] {
	return memGames;
}
	
export function createGame(
	data: GameParams
): Either<Error,Game>{
	const [rounds, errs] = splitOf(
		data.rounds.map(createRound),
		Round,
		Error
	);

	if(errs.length !== 0){
		return new Error(errs.join(','));
	}

	const game = new Game({
		...data,
		rounds
	});
	
	memGames.push(game);

	return game
}

export function getPlayerGame(
	playerId: string
): Either<Error, Game> {
	const game = memGames.find(({ players})	=>
		players.find(p =>
			(p.playerId === playerId) !== undefined
		)
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


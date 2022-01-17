import { Either } from './fp';
import {
	Round,
	Evented,
	GameEvents,
	GameState,
} from 'dfs-common';
import { getTask, getTasksLength } from './task';

const memGames:Game[] = [];

type GameParams = {
	gameId: string
	players: string[]
	msRoundLength: number
}
export class Game extends Evented<keyof GameEvents>{
	state: GameState;
	roundTimer: NodeJS.Timeout | undefined;

	constructor({ gameId, players, msRoundLength }: GameParams){
		super();
		
		this.state = {
			gameId,
			players: players.map(playerId => ({ playerId, ready: false })),
			rounds: [],
			msRoundLength,
		};

		this.on("player_ready", () => startIfPlayersReady(this));
		this.on("player_ready", () => this.trigger("state"));
		this.on("answer", () => this.trigger("state"));
		this.on("stop", () => this.trigger("state"));
		this.on("start", () => this.trigger("state"));
		this.on("round", () => this.trigger("state"));
	}
}

export function getGames(): Game[]{
	return memGames;
}

export function createGame(params: GameParams): Game{
	const game = new Game(params);
	memGames.push(game);

	return game
}

export function getPlayerGame(playerId: string): Either<Error, Game> {
	const game = memGames.find(g => {
		const player = g.state.players.find(p => p.playerId === playerId);
		return player !== undefined;
	});

	if(game === undefined){
		return new Error("No game found for player.");
	}
	
	return game;
}

export function getGame(gameId: string): Either<Error, Game> {
	const game = memGames.find(g => g.state.gameId === gameId);
	if(game === undefined){
		return new Error("Game not found.");
	}
	return game;
}

function startIfPlayersReady(game: Game){
	const [blue, red] = game.state.players;
	
	if(blue.ready !== true){
		return
	}
	
	if(red.ready !== true){
		return
	}

	startGame(game);
};

export function setPlayerReady(
	game: Game, playerId: string, ready: boolean
): Either<Error, undefined>{
	const player = game.state.players.find(p => p.playerId === playerId);
	if(!player){
		return new Error("Player not found in game.")
	}
	
	player.ready = ready;
	game.trigger("player_ready", player);
}

export function getRoundsLen(_game: Game): number{
	return getTasksLength();
}

export function startGame(game: Game){
	game.trigger("start", game.state);
	game.state.startTime = Date.now();
	nextRound(game, 0);
}

function stopGame(game: Game): Game{
	game.trigger("stop", game.state);
	return game;
}

function nextRound(game: Game, roundNumber: number): Either<Error, Game> {
	const task = getTask(roundNumber);
	if(task === undefined){
		return stopGame(game);
	}
	
	const round: Round = {
		roundNumber,
		task,
		startTime: Date.now(),
	};
	
	game.state.rounds.push(round);
	game.trigger("round", game.state);
	
	game.roundTimer = setTimeout(() => {
		nextRound(game, roundNumber + 1);
	}, game.state.msRoundLength);
	
	return game;
}

export function answerGame(
	game: Game, roundNo: number, option: number
): Either<Error, boolean> {
	const round = game.state.rounds[roundNo];

	if(round === undefined){
		return new Error("Error answerGame: invalid round number.");
	}

	if (round !== undefined && round.answer !== undefined){
		return new Error("error answerGame: round already answered.");
	}

	if(game.roundTimer === undefined){
		return new Error("error answerGame: not in any round.");
	}

	clearTimeout(game.roundTimer);

	// update round
	round.answer = option;

	game.trigger("answer", { option, roundNo });

	// move game forward to next state
	nextRound(game, roundNo + 1);

	const correctOption = round.task.correctOption;
	if (option === correctOption) {
		return true;
	}

	return false;
}

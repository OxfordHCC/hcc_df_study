import { Socket, Server, Namespace } from "socket.io";
import { ClientGameState, deepClone } from 'dfs-common';
import { io } from './index';
import { Logger } from '../lib/log';
import { Either } from "../lib/fp";
import { Game, getPlayerGame, getGame, setPlayerReady,
	answerGame } from "../lib/game";

const { log, error } = Logger("socket.io/client");

export default function(client: Namespace){
	client.on("connection", (socket: Socket) => {
		log("connection", socket.id);
		const connErr = onConnect(socket);
		if (connErr instanceof Error) {
			socket.disconnect();
			error("connection", socket.id, connErr.message);
		}
	});
}

function getClientGameState(game: Game, playerId: string) {
	const gameState = deepClone<ClientGameState>(game.state);
	const isRed = gameState.players[1].playerId === playerId;

	const lastRound = gameState.rounds[gameState.rounds.length - 1];
	if (!lastRound) {
		// no rounds yet... game did not start
		return gameState;
	}

	const timedOut = (Date.now() - lastRound.startTime) > game.state.msRoundLength;
	const answered = lastRound.answer !== undefined;
	const finished = timedOut || answered;
	
	// if isRed, hide correct option of last round from player
	if (isRed && !finished) {
		lastRound.task.correctOption = undefined;
	}

	return gameState;
}

function onAnswer(socket: Socket, io: Server) {
	const { gameId } = socket.data;
	const game = getGame(gameId);

	return function({ option, round }: { option: number, round: number }) {
		log("onAnswer",`game=${gameId}`,`option=${option}`,`round=${round}`);
		if(game instanceof Error){
			socket.emit("error", game.message);
			return;
		}
		answerGame(game, round, option);
	}
}

function onPlayerReady(socket: Socket, io: Server){
	const { gameId, playerId } = socket.data;
	const game = getGame(gameId);
	log("on_player_ready", `gameId=${gameId}`, `playerId=${playerId}`);

	// do nothing
	return function(readyFlag: boolean){
		if(game instanceof Error){
			error(game.message);
			socket.emit("error", game.message);
			return;
		}

		const err = setPlayerReady(game, playerId, readyFlag);
		if (err !== undefined) {
			error(err.message);
			return socket.emit("error", err.message);
		}
	}
}

type HandshakeQuery = {	playerId: string }
function getHandshakeQuery(socket: Socket): Either<Error, HandshakeQuery> {
	const { playerId } = socket.handshake.query;

	if(playerId === undefined){
		return Error("player id missing from socket handshake query");
	}

	if(typeof playerId !== "string"){
		return Error("invalid playerId provided. Must be string.");
	}

	return { playerId };
}

function onConnect(socket: Socket): Either<Error, undefined> {
	const hShakeQuery = getHandshakeQuery(socket);

	if(hShakeQuery instanceof Error){
		return hShakeQuery;
	}
	
	const { playerId } = hShakeQuery;
	const game = getPlayerGame(playerId);

	if(game instanceof Error){
		return game
	}
	
	const { gameId } = game.state;

	// cache some data related to this socket
	socket.data = {
		playerId,
		gameId,
		...socket.data,
	}
	socket.join(gameId);
	socket.to(gameId).emit("joined_game", { playerId });

	// when game state changes, let socket know
	game.on("state", () => socket.emit("state", getClientGameState(game, playerId)));
	
	// when a new client connects, send game info and roundInfo if
	const gameState = getClientGameState(game, playerId);
	socket.emit("state", gameState);

	// handle events from socket
	socket.on('game:player_ready', onPlayerReady(socket, io));
	socket.on('game:answer', onAnswer(socket, io));
	socket.on('disconnect', onDisconnect(socket, io));
}

function onDisconnect(socket: Socket, _io: Server) {
	return function(reason: string) {
		log("dsisconnect", socket.id, reason);
		
		const { gameId, playerId } = socket.data;
		if (gameId === undefined || playerId === undefined) {
			// disconnected before we could initialize the socket
			return;
		}

		const game = getGame(gameId);
		if(game instanceof Error){
			error("disconnect", game.message);
			return;
		}

		// unready player when disconnecting
		setPlayerReady(game, playerId, false);
		
		// let other player know they've disconnected
		socket.to(gameId).emit("left_game", playerId);
	}
}

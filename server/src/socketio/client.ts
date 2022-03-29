import { Socket, Server, Namespace } from "socket.io";
import { Either, Left, Right } from 'monet';
import { FutureInstance, chain, map } from "fluture";
import { deepClone, Answer, GameData, GameClientNs } from 'dfs-common';

import { e2f } from '../lib/util';
import { io } from './index';
import { Logger } from '../lib/log';
import { getPlayerSession, getCurrentGame } from '../lib/session';
import { Game, getGame } from "../lib/game";

const { log, error } = Logger("socket.io/client");

type GameClientNamespace = Namespace<GameClientNs.ClientToServerEvents, GameClientNs.ServerToClientEvents, GameClientNs.InterServerEvents, GameClientNs.SocketData>;

export default function(client: GameClientNamespace){
	client.on("connection", (socket: Socket) => {
		log("connection", socket.id);
		const connErr = onConnect(socket);
		if (connErr instanceof Error) {
			socket.disconnect();
			error("connection", socket.id, connErr.message);
		}
	});
}

function getClientGameState(game: Game, _playerId: string) {
	const gameState = deepClone<GameData>(game.state());
	
	return gameState;
}

function emitError(socket: Socket){
	return function(e: Error){
		error(e.message);
		socket.emit("error", e.message);
	}
}

function onAnswer(socket: Socket, _io: Server) {
	const { gameId } = socket.data;
	return function(answer: Answer) {
		getGame(gameId)
			.map(game => {
				log("onAnswer", `game=${gameId}`, `answer=${JSON.stringify(answer)}`);
				game.answer(answer);
			})
			.leftMap(emitError(socket));
	}
}

function onPlayerReady(socket: Socket, _io: Server) {
	const { gameId, playerId } = socket.data;
	return function(readyFlag: boolean) {
		getGame(gameId)
			.map(game => {
				log("on_player_ready", `gameId=${gameId}`, `playerId=${playerId}`);
				return game.playerReady(playerId, readyFlag);
			})
			.leftMap(emitError(socket));
	}
}

type HandshakeQuery = {	playerId: string }
function getHandshakeQuery(socket: Socket): Either<Error, HandshakeQuery> {
	const { playerId } = socket.handshake.query;

	if(playerId === undefined){
		return Left(Error("player id missing from socket handshake query"));
	}

	if(typeof playerId !== "string"){
		return Left(Error("invalid playerId provided. Must be string."));
	}

	return Right({ playerId });
}

function saveSocketData(socket: Socket){
	return function<T>(data: T){
		socket.data = {
			...socket.data,
			...data
		}
		return data;
	}
}

function onConnect(socket: Socket): FutureInstance<Error, void> {
	function onPlayerConnect(playerId: string): FutureInstance<Error, void>{
		return getPlayerSession(playerId)
		.pipe(chain(session => getCurrentGame(session.sessionId)))
		.pipe(map(game => {
			const { gameId } = game;
			saveSocketData(socket)({
				gameId
			});
			
			game.on("state", () => socket.emit("state", getClientGameState(game, playerId)));

			socket.join(gameId);
			socket.to(gameId).emit("joined_game", { playerId });

			// handle events from socket
			socket.on('game:player_ready', onPlayerReady(socket, io));
			socket.on('game:answer', onAnswer(socket, io));
			socket.on('disconnect', onDisconnect(socket, io));

			// when a new client connects, send game info and roundInfo if
			const gameState = getClientGameState(game, playerId);
			socket.emit("state", gameState);
		}));
	}
	
	return e2f(
		getHandshakeQuery(socket)
		.map(({playerId}) => saveSocketData(socket)({playerId}))
		.map(({playerId}) => playerId)
	).pipe(chain(onPlayerConnect))
}

function onDisconnect(socket: Socket, _io: Server) {
	const { gameId, playerId } = socket.data;
	
	return function(reason: string) {
		log("dsisconnect", socket.id, reason);

		getGame(gameId)
		.map(game => {
			// unready player when disconnecting
			game.playerReady(playerId, false);
			
			// let other player know they've disconnected
			socket.to(gameId).emit("left_game", playerId);
		})
		.leftMap(err => {
			error("disconnect", err.message);
		})
	}
}

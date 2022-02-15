import { io } from "./socketio";
import { createGame } from './lib/game';
import { Logger } from './lib/log';
import { ButtonRound } from './lib/round';
import { createPlayer } from './lib/player';

const { log } = Logger("main");

createGame({
	gameId: "foobar_game",
	players: ['foobar', 'boombar'].map(pid => createPlayer(pid)),
	rounds: [
		new ButtonRound(0),
		new ButtonRound(1),
		new ButtonRound(2),
		new ButtonRound(3),
		new ButtonRound(4)
	]
});


io.listen(3000);
log("websockets-listening","3000");

import { io } from "./socketio";
import { createGame } from './lib/game';
import { Logger } from './lib/log';

const { log } = Logger("main");

createGame({
	gameId: "foobar_game",
	players: ['foobar', 'boombar'],
	msRoundLength: 5000,
});


io.listen(3000);
log("listening","3000");

import { io } from "./socketio";
import { createGame } from './lib/game';

createGame({
	gameId: "foobar_game",
	players: ['foobar', 'boombar'],
	msRoundLength: 5000,
});

// start listening on port 3000
io.listen(3000);

import { io } from "./socketio";
import { Logger } from './lib/log';

const { log } = Logger("main");

// TODO: sync database, games, containers

io.listen(3000);
log("websockets-listening","3000");

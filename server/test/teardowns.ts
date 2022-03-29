import path from 'path';
import { readFileSync } from 'fs';
import { parallel, map, chain, promise } from 'fluture';
import {
	getGames,
	removeGame
} from '../src/lib/game';
import { withDb } from '../src/lib/db';
import * as docker from '../src/lib/dockerlib';

const initSQLFile = path.resolve(__dirname, '../db/init.sql');
const initSQL = readFileSync(initSQLFile, "utf8");

export function resetGames() {
	return promise(parallel(1)(getGames().map(removeGame)));
}

export function resetDb() {
	return promise(withDb(({exec}) => exec(initSQL)))
}

export function resetContainers() {
	const f = docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	})
	.pipe(map(containers => containers.map(c => c.Id)))
	.pipe(chain(containers => docker.stop(...containers)))
	.pipe(chain(containers => docker.rm(...containers)));

	return promise(f);
}


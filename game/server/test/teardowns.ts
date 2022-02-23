import path from 'path';
import { readFileSync } from 'fs';
import {
	getGames,
	removeGame
} from '../src/lib/game';
import { withDb } from '../src/lib/db';
import * as docker from '../src/lib/dockerlib';

const initSQLFile = path.resolve(__dirname, '../db/init.sql');
const initSQL = readFileSync(initSQLFile, "utf8");

export function resetGames() {
	getGames().map(removeGame);
}

export async function resetDb() {
	await withDb<void>(
		db => new Promise((resolve, reject) => 
			db.exec(initSQL, err =>
				err && reject(err) || resolve(null)
			)
		)
	);
}

export async function resetContainers() {
	const murmurContainers = await docker.ps({
		all: true,
		filters: {
			ancestor: "mumble_server"
		}
	});

	if(murmurContainers instanceof Error){
		throw murmurContainers;
	}

	const cids = murmurContainers.map(c => c.Id)
	await docker.stop(...cids);
	await docker.rm(...cids);
}


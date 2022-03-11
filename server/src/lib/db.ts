import sqlite from 'sqlite3';
import { Either } from 'dfs-common';

type withDbFunction = (db: sqlite.Database) => any;

const dbFile = process.env.DFS_DB_FILE;
if(dbFile === undefined){
	throw new Error("Missing DFS_DB_FILE env variable.");
}

export async function withDb<T>(fn: withDbFunction): Promise<Either<Error, T>> {
	if(dbFile === undefined){
		return new Error("dbFile undefined.");
	}

	return new Promise(async (resolve, reject) => {
		const db = new sqlite.Database(dbFile);
		try {
			const res = await fn(db);
			db.close((err) => err && resolve(err) || resolve(res));
		} catch (err) {
			db.close((closeErr) => closeErr && resolve(closeErr) || resolve(err as Error));
		}
	});
}

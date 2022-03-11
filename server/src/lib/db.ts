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
	
	const db = new sqlite.Database(dbFile);
	try {
		const res = await fn(db);
		db.close();
		return res;
	} catch (err: any) {
		db.close();
		// I do this check to narrow the type for typescript
		if (err instanceof Error) {
			return err
		}
		// This should never be reached, but who knows. Depends on
		// the sqlite library
		return new Error("Unknown sqlite error.");
	}
}


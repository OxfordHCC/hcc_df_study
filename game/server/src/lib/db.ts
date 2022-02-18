import path from 'path';
import sqlite from 'sqlite3';
import { Either } from 'dfs-common';

const dbDir = path.resolve(__dirname, "../../db/");
const dbFile = path.join(dbDir, "main.db");
const initSql = path.join(dbDir, "init.sql");

type withDbFunction = (db: sqlite.Database) => any;
export async function withDb<T>(fn: withDbFunction): Promise<Either<Error, T>>{
	const db = new sqlite.Database(dbFile);
	try {
		const res = await fn(db);
		db.close();
		return res;
	} catch (err: any) {
		db.close();
		// I do this check to narrow the type for typescript
		if(err instanceof Error){
			return new Error(err.message);
		}
		// This should never be reached, but who knows, depends on
		// the sqlite library
		return new Error("Unknown sqlite error.");
	}
}


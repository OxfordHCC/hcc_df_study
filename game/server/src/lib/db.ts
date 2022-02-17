import path from 'path';
import sqlite from 'sqlite3';

const dbDir = path.resolve(__dirname, "../../db/");
const dbFile = path.join(dbDir, "main.db");
const initSql = path.join(dbDir, "init.sql");

type withDbFunction = (db: sqlite.Database) => Promise<any>;
export async function withDb(fn: withDbFunction){
	const db = new sqlite.Database(dbFile);
	const res = await fn(db);
	db.close();
	return res;
}


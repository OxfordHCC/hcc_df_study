import sqlite from 'sqlite3';
import { parallel, Future, FutureInstance, reject, map, chain, node } from 'fluture';
import { config } from '../config';
import { Logger } from './log';

const { error, log } = Logger("db");

type RowID = number;
type WithDbFunctionParams = {
	all: (query: string, params?: object) => FutureInstance<Error, any[]>
	serialize: (...dbRuns: FutureInstance<Error, any>[]) => FutureInstance<Error, unknown>
	run: (query: string, params?: object) => FutureInstance<Error, RowID>
	exec: (query: string) => FutureInstance<Error, void>
};

type withDbFunction<T> = (params: WithDbFunctionParams) => FutureInstance<Error, T>;


const dbFile = config.DFS_DB_FILE;
if(dbFile === undefined){
	throw new Error("Missing DFS_DB_FILE env variable.");
}

export function withDb<T>(fn: withDbFunction<T>): FutureInstance<Error, T> {
	if(dbFile === undefined){
		return reject(new Error("dbFile undefined."));
	}

	const db = new sqlite.Database(dbFile);

	function closeDb(x: any){
		return node(db.close.bind(db))
		.pipe(map((_void) => x));
	}

	function exec(query: string){
		return Future<Error, void>(function(rej, res){
			db.exec(query, function(err){
				if(err !== null){
					error("run", query)
					return rej(err);
				}
				return res();
			});
			return () => {};
		});
	}

	function all(query: string, params?: object){
		return Future<Error, any[]>(function(rej, res){
			db.all(query, params, (err, rows) => {
				if (err !== null) {
					error("run", query, JSON.stringify(params))
					return rej(err);
				}
				return res(rows);
			});

			return () => {}
		});
	}
	
	function run(query: string, params?: object){
		return Future<Error, RowID>((rej, res) => {
			db.run(query, params, function(err) {
				if (err !== null) {
					error("run", query, JSON.stringify(params))
					return rej(err);
				}
				const { lastID } = this;
				return res(lastID);
			});
				
			return () => { };
		});
	}

	function serialize(...dbRuns: FutureInstance<Error, any>[]){
		return parallel(1)(dbRuns);
	}
	
	return fn({	run, serialize, all, exec })
	.pipe(chain(closeDb));
}

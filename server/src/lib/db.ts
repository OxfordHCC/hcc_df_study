import sqlite from 'sqlite3';
import { parallel, Future, FutureInstance, reject, map, chain, node } from 'fluture';

type RowID = number;
type WithDbFunctionParams = {
	all: (query: string, params?: object) => FutureInstance<Error, any[]>
	serialize: (...dbRuns: FutureInstance<Error, any>[]) => FutureInstance<Error, unknown>
	run: (query: string, params?: object) => FutureInstance<Error, RowID>
};

type withDbFunction<T> = (params: WithDbFunctionParams) => FutureInstance<Error, T>;

const dbFile = process.env.DFS_DB_FILE;
if(dbFile === undefined){
	throw new Error("Missing DFS_DB_FILE env variable.");
}

export function withDb<T>(fn: withDbFunction<T>): FutureInstance<Error, T> {
	if(dbFile === undefined){
		return reject(new Error("dbFile undefined."));
	}

	const db = new sqlite.Database(dbFile);

	function closeDb(x: any){
		return node(db.close)
		.pipe(map((_void) => x));
	}

	function all(query: string, params?: object){
		return Future<Error, any[]>((rej, res) => {
			db.all(query, params, function(err, rows){
				if(err !== null){
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
	
	return fn({	run, serialize, all })
	.pipe(chain(closeDb));
}

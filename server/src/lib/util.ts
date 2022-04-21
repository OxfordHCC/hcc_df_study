import { FutureInstance, Future, attemptP } from 'fluture';
import { Either, Right, Left, List } from 'monet';
import { exec } from 'child_process';
import { readdir, open, FileHandle } from 'fs/promises';

export function readdirP(dir: string){
	return attemptP<Error, string[]>(() => readdir(dir));
}

export function openfileP(
	filePath: string, flags: string | number, mode?: string | number
){
	return attemptP(() => open(filePath, flags, mode));
}

export function readfileP(startBytes: number, length: number){
	return function(fileHandle: FileHandle){
		return attemptP(async () => {
			const outBuf = Buffer.alloc(length);
			return attemptP(() =>
				fileHandle.read(outBuf, 0, length, startBytes));
		});
	}
}

// execFuture
// for now, only utf8 output is supported
// this makes some things easier wrt to type checking (eg. string vs buffer)
export function execF(command: string): FutureInstance<Error, string>{
	return Future((rej, res) => {
		exec(command, (err, stdout, stderr) => {
			if(err !== null){
				return rej(err);
			}
			if(stderr.length > 0){
				return rej(new Error(stderr));
			}
			return res(stdout);
		});
		
		return ()=>{};
	});
}


export function sort<T>(fn: (a: T, b: T) => number): (elements: T[]) => T[] {
	return function(elements) {
		return elements.sort(fn);
	}
};

export function filter<T>(fn:(el: T) => boolean): (elements: Array<T>) => Array<T>{
	return function(elements){
		return elements.filter(fn);
	}
};

// either2future - turn either into future :D 
export function e2f<E, A>(a: Either<E, A>): FutureInstance<E, A> {
	return Future<E, A>((rej, res) => {
		a.map(res).leftMap(rej);
		
		// cancellation function (noop)
		return () => {}
	});
}

export function find<T>(fn:(el: T) => boolean): (elements: T[]) => Either<Error, T>{
	return function(elements){
		const res = elements.find(fn);
		if(res === undefined){
			return Left(new Error("Cannot find element"));
		}
		return Right(res);
	}
}

function list2a<T>(l: List<T>): Array<T> {
	return l.toArray();
}

function a2list<T>(arr: Array<T>): List<T>{
	return List.fromArray(arr);
}

// turn array of eithers to either of arrays
// ie Either<E,T>[] -> Either<E,T[]>
export function aoe2ea<E,T>(arr: Array<Either<E,T>>): Either<E, Array<T>>{
	return a2list(arr).sequenceEither<E,T>().map(list2a);
}



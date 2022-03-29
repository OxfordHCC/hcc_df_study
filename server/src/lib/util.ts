import { FutureInstance, Future } from 'fluture';
import { Either, Right, Left, List } from 'monet';

export function sort<T>(fn: (a:T, b: T) => number): (elements: T[]) => T[]{
	return function(elements){
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


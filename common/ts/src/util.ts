export function deepClone<T>(a: T): T{
	return JSON.parse(JSON.stringify(a));
}

export function filterOf<T>(arr: any[], constructor: Function): T[]{
	return arr.filter(x => x instanceof constructor);
}

export function isError(x: any): x is Error{
	return x instanceof Error;
}

export function joinErrors(errs: any[]): Error{
	return new Error(errs.filter(isError).map(err => err.message).join('\n'));
}

function eitherToFuture<E, A>(a: Either<E, A>): FutureInstance<E,A>{
	return Future<E,A>((rej, res) => {
		a.map(res).leftMap(rej);
		
		// cancellation function (noop)
		return () => {}
	});
}


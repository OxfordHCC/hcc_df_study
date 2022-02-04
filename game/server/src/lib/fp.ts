export type Either<L, R> = L | R;

type Constructor<T> = (...args: any[]) => T;

export function filterOf<T>(arr: any[], constructor: Constructor<T>): T[]{
	return arr.filter(x => x instanceof constructor);
}

export function splitOf<L,R>(
	arr: Either<L,R>[],
	leftConstructor: Constructor<L>,
	rightConstructor: Constructor<R>
): [L[], R[]]{
	return [
		filterOf<L>(arr, leftConstructor),
		filterOf<R>(arr, rightConstructor),
	];
}


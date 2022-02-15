export type Either<L, R> = L | R;

export function filterOf<T>(arr: any[], constructor: Function): T[]{
	return arr.filter(x => x instanceof constructor);
}

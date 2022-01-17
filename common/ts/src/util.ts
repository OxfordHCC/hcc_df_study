export function deepClone<T>(a: T): T{
	return JSON.parse(JSON.stringify(a));
}

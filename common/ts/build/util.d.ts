export declare function deepClone<T>(a: T): T;
export declare type Either<L, R> = L | R;
export declare function filterOf<T>(arr: any[], constructor: Function): T[];
export declare function isError(x: any): x is Error;
export declare function joinErrors(errs: any[]): Error;

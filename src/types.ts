export type Rename<
T,
K extends keyof T,
N extends string | number | symbol
> = Pick<T, Exclude<keyof T, K>> & { [P in N]: T[K] };

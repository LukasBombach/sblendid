type PUUID = string;
type SUUID = string;
type CUUID = string;
type DUUID = string;

type Promish<T> = Promise<T> | T;

type AnyFunction = (...args: any[]) => any;

type PromisifiedFunction<T extends AnyFunction> = T extends (
  callback: (err: Error) => void
) => void
  ? () => Promise<void>
  : never;

type Promisified<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? PromisifiedFunction<T[K]> : never;
};

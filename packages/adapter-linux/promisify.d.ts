type Promisify<T> = T extends (callback: (err: Error | null) => void) => void
  ? () => Promise<void>
  : T extends (
      callback: (err: Error | null, result: infer TResult) => void
    ) => void
  ? () => Promise<TResult>
  : T extends (
      arg1: infer T1,
      callback: (err: Error | null, result: infer TResult) => void
    ) => void
  ? (arg1: T1) => Promise<TResult>
  : T extends (
      arg1: infer T1,
      arg2: infer T2,
      callback: (err: Error | null, result: infer TResult) => void
    ) => void
  ? (arg1: T1, arg2: T2) => Promise<TResult>
  : T extends (
      arg1: infer T1,
      arg2: infer T2,
      arg3: infer T3,
      callback: (err: Error | null, result: infer TResult) => void
    ) => void
  ? (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>
  : T extends (
      arg1: infer T1,
      arg2: infer T2,
      arg3: infer T3,
      arg4: infer T4,
      callback: (err: Error | null, result: infer TResult) => void
    ) => void
  ? (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>
  : never;

type PromisifyAll<T extends {}> = { [K in keyof T]: Promisify<T[K]> };

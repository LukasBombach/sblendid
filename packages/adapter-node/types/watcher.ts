export interface Emitter<A extends {}> {
  on: <E extends keyof A>(event: E, listener: A[E]) => any;
  off: <E extends keyof A>(event: E, listener: A[E]) => any;
}

export type GetApi<E extends Emitter<any>> = E extends Emitter<infer T>
  ? T
  : never;

export type Value<A extends {}, E extends keyof A> = A[E] extends (
  ...args: any[]
) => any
  ? Parameters<A[E]>
  : never;

export type Condition<A extends {}, E extends keyof A> = (
  ...args: Value<A, E>
) => Promise<boolean> | boolean;

type A = { foo: (str: string) => void };
type E = keyof A;
type M = Emitter<A>;

type A2 = GetApi<M>;

const m = {} as M;

m.on("foo", str => {});

/* export interface Emitter<A extends {} = {}> {
  on: (event: keyof A, listener: A[typeof event]) => any;
  off: (event: keyof A, listener: A[typeof event]) => any;
} */

/* export interface Emitter<A extends {} = {}, E extends keyof A = keyof A> {
  on: (event: E, listener: A[E]) => any;
  off: (event: E, listener: A[E]) => any;
} */

/* export type Event<A extends {}, E extends Emitter<A>> = E extends Emitter<
  infer T
>
  ? keyof T
  : never; */
/* export type Event<A extends {}> = keyof A;

export type Value<
  A extends {},
  E extends keyof A,
  K extends Event<E>
> = E extends Emitter<infer T>
  ? T[K] extends (...args: any[]) => any
    ? Parameters<T[K]>
    : never
  : never; */

/* export type Condition<
  A extends {},
  E extends Emitter<A>,
  K extends Event<A>
> = (...args: Value<E, K>) => Promise<boolean> | boolean; */

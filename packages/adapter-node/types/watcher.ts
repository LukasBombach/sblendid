export type Api = Record<string, (...args: any[]) => any>;

export interface Emitter<A extends {}> {
  on: <E extends keyof A>(event: E, listener: Listener<A, E>) => any;
  off: <E extends keyof A>(event: E, listener: Listener<A, E>) => any;
}

export type Listener<A extends {}, E extends keyof A> = (
  ...args: Value<A, E>
) => any;

export type Value<A extends {}, E extends keyof A> = A[E] extends (
  ...args: any[]
) => any
  ? Parameters<A[E]>
  : never;

export type Condition<A extends {}, E extends keyof A> = (
  ...args: Value<A, E>
) => Promise<boolean> | boolean;

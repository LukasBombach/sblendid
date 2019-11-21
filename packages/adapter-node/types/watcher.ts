export interface Emitter<A extends {}> {
  on: <E extends keyof A>(event: E, listener: A[E]) => any;
  off: <E extends keyof A>(event: E, listener: A[E]) => any;
}

export type Event<E extends Emitter<any>> = E extends Emitter<infer T>
  ? keyof T
  : never;

export type Value<
  E extends Emitter<any>,
  K extends Event<E>
> = E extends Emitter<infer T>
  ? T[K] extends (...args: any[]) => any
    ? Parameters<T[K]>
    : never
  : never;

export type Condition<E extends Emitter<any>, K extends Event<E>> = (
  ...args: Value<E, K>
) => Promise<boolean> | boolean;

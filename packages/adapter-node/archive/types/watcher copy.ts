export type Emitter<E, L extends Listener> = {
  on: (event: E, listener: L) => any;
  off: (event: E, listener: L) => any;
};

export type Listener = (...args: any[]) => any;

export type Event<A extends Emitter<any, any>> = A extends Emitter<infer T, any>
  ? T
  : never;

export type Value<A extends Emitter<any, any>> = A extends Emitter<any, infer T>
  ? Parameters<T>
  : never;

export type Condition<A extends Emitter<any, any>> = (
  ...args: Value<A>
) => Promise<boolean> | boolean;

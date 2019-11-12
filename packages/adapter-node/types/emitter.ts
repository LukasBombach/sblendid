export default interface Emitter<A extends Api> {
  on: <E extends keyof A>(event: E, listener: A[E]) => void;
  off: <E extends keyof A>(event: E, listener: A[E]) => void;
}

export type Api = Record<string, (...args: any[]) => any>;

export type GetApi<E extends Emitter<any>> = E extends Emitter<infer T>
  ? T
  : never;

export type Events<E extends Emitter<any>> = keyof GetApi<E>;

export type Listener<E extends Emitter<any>, K extends Events<E>> = GetApi<
  E
>[K];

export type Value<E extends Emitter<any>, K extends Events<E>> = Parameters<
  Listener<E, K>
>;

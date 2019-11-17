export default abstract class Emitter<A extends {}> {
  public abstract on<E extends keyof A>(event: E, listener: A[E]): void;
  public abstract off<E extends keyof A>(event: E, listener: A[E]): void;
}

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

/* import Device from "../src/linux/device";

interface Mngr {
  device: (device: Device) => void;
}

const x = {} as Emitter<Mngr>;

x.on("device", device => {
  device.toNoble();
});
 */

/* export type OnOffFn<E, L extends (...args: any[]) => any> = (
  event: E,
  listener: L
) => any;

export type Emitter<E, L extends (...args: any[]) => any> = {
  on: OnOffFn<E, L>;
  off: OnOffFn<E, L>;
}; */

/* export type Emitter<E, L extends Listener> = {
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
 */

import Queue from "./queue";
import ObjectManager, { Api } from "./linux/objectManager";

export interface Emitter<A extends {}> {
  on: <E extends keyof A>(
    event: E,
    listener: (...args: Value<A, E>) => void
  ) => void;
  off: <E extends keyof A>(
    event: E,
    listener: (...args: Value<A, E>) => void
  ) => void;
}

export type Value<A extends {}, E extends keyof A> = A[E] extends (
  ...args: any
) => any
  ? Parameters<A[E]>
  : never;

export type Condition<A extends {}, E extends keyof A> = (
  ...args: Value<A, E>
) => Promish<boolean>;

export type Promish<T> = Promise<T> | T;

type OnFn<E, L extends Function> = (event: E, listener: L) => any;
type OnEmitter<E, L extends Function> = { on: OnFn<E, L> };

type GetEvent<A extends OnEmitter<any, any>> = A extends OnEmitter<infer T, any>
  ? T
  : never;

type GetValue<A extends OnEmitter<any, any>> = A extends OnEmitter<any, infer T>
  ? T
  : never;

export default class Watcher<
  A extends OnEmitter<any, any>,
  E extends GetEvent<A>
> {
  private promise: Promise<Value<A, E>>;
  private queue = new Queue();
  constructor(emitter: A, event: E, condition: Condition<A, E>) {
    this.promise = new Promise(res => {
      const listener = async (...args: Value<A, E>) => {
        if (await this.isMet(condition, args)) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }
  public resolved(): Promise<GetValue<A>> {
    return this.promise;
  }
  private async isMet(
    condition: Condition<A, E>,
    args: Value<A, E>
  ): Promise<boolean> {
    return await this.queue.add(() => condition(...args));
  }
}

(async () => {
  const watcher = new Watcher(new ObjectManager(), "discover", () => true);

  const x = await watcher.resolved();
})();

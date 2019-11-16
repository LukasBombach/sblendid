import Queue from "./queue";

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

export default class Watcher<A extends {}, E extends keyof A> {
  private promise: Promise<Value<A, E>>;
  private queue = new Queue();

  constructor(emitter: Emitter<A>, event: E, condition: Condition<A, E>) {
    this.promise = new Promise(res => {
      const listener = async (...args: Value<A, E>) => {
        const conditionIsMet = await this.queue.add(() => condition(...args));
        if (conditionIsMet) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }

  public resolved(): Promise<Value<A, E>> {
    return this.promise;
  }
}

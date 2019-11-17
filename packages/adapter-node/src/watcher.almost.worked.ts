// import { Emitter, Event, Value, Condition } from "../types/emitter";
import Queue from "./queue";

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

export default class Watcher<A extends Emitter<any, any>, E extends Event<A>> {
  private promise: Promise<Value<A>>;
  private queue = new Queue();

  constructor(emitter: A, event: E, condition: Condition<A>) {
    this.promise = new Promise(res => {
      const listener = async (...args: Value<A>) => {
        if (await this.isMet(condition, args)) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }

  public resolved(): Promise<Value<A>> {
    return this.promise;
  }

  private async isMet(
    condition: Condition<A>,
    args: Value<A>
  ): Promise<boolean> {
    return await this.queue.add(() => condition(...args));
  }
}

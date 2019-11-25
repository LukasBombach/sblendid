import { Emitter, Event, Value, Condition } from "../types/watcher";
import Queue from "./queue";

export default class Watcher<E extends Emitter<any>, K extends Event<E>> {
  private promise: Promise<Value<E, K>>;
  private queue = new Queue();

  public static async resolved<E extends Emitter<any>, K extends Event<E>>(
    emitter: E,
    event: K,
    condition: Condition<E, K>
  ): Promise<Value<E, K>> {
    const watcher = new Watcher(emitter, event, condition);
    return await watcher.resolved();
  }

  constructor(emitter: E, event: K, condition: Condition<E, K>) {
    this.promise = new Promise(res => {
      const listener = async (...args: Value<E, K>) => {
        if (await this.isMet(condition, args)) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }

  public resolved(): Promise<Value<E, K>> {
    return this.promise;
  }

  private async isMet(
    condition: Condition<E, K>,
    args: Value<E, K>
  ): Promise<boolean> {
    return await this.queue.add(() => condition(...args));
  }
}

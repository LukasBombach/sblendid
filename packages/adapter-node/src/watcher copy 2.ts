import { Emitter, Event, Value, Condition } from "../types/watcher";
import Queue from "./queue";

//export default class Watcher<A extends {}, E extends Event<M>, M = Emitter<A>> {
export default class Watcher<A extends {}, M = Emitter<A>> {
  private promise: Promise<Value<M, Event<M>>>;
  private queue = new Queue();

  /* public static async resolved<
    A extends {},
    M extends Emitter<A>,
    E extends Event<M>
  >(emitter: M, event: E, condition: Condition<M, E>): Promise<Value<M, E>> {
    const watcher = new Watcher(emitter, event, condition);
    return await watcher.resolved();
  } */

  constructor(emitter: M, event: E, condition: Condition<M, E>) {
    this.promise = new Promise(res => {
      const listener = async (...args: Value<M, E>) => {
        if (await this.isMet(condition, args)) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }

  public resolved(): Promise<Value<M, E>> {
    return this.promise;
  }

  private async isMet(
    condition: Condition<M, E>,
    args: Value<M, E>
  ): Promise<boolean> {
    return await this.queue.add(() => condition(...args));
  }
}

import { Emitter, Value, Condition, Api } from "../types/watcher";
import Queue from "./queue";

export default class Watcher<A extends {}, E extends keyof A> {
  private promise: Promise<Value<A, E>>;
  private queue = new Queue();

  public static async resolved<A extends {}, E extends keyof A>(
    emitter: Emitter<A>,
    event: E,
    condition: Condition<A, E>
  ): Promise<Value<A, E>> {
    const watcher = new Watcher(emitter, event, condition);
    return await watcher.resolved();
  }

  constructor(emitter: Emitter<A>, event: E, condition: Condition<A, E>) {
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

  public resolved(): Promise<Value<A, E>> {
    return this.promise;
  }

  private async isMet(
    condition: Condition<A, E>,
    args: Value<A, E>
  ): Promise<boolean> {
    return await this.queue.add(() => condition(...args));
  }
}

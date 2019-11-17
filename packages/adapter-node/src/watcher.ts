import { Emitter, Event, Value, Condition } from "../types/watcher";
import Queue from "./queue";

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

import { Emitter, GetApi, Value, Condition } from "../types/watcher";
import Queue from "./queue";
import ObjectManager from "./linux/objectManager";

//export default class Watcher<A extends {}, E extends Event<M>, M = Emitter<A>> {
export default class Watcher<
  M extends Emitter<any>,
  E extends keyof GetApi<M>,
  A = GetApi<M>
> {
  // export default class Watcher<A extends {}, E extends keyof A, M = Emitter<A>> {
  private promise: Promise<Value<A, E>>;
  private queue = new Queue();

  /* public static async resolved<
    A extends {},
    M extends Emitter<A>,
    E extends Event<M>
  >(emitter: M, event: E, condition: Condition<M, E>): Prosmise<Value<M, E>> {
    const watcher = new Watcher(emitter, event, condition);
    return await watcher.resolved();
  } */

  constructor(emitter: M, event: E, condition: Condition<A, E>) {
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

const watcher = new Watcher(new ObjectManager(), "discover", () => true);

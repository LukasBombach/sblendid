/* import { inherits } from "util";

import Bindings, {
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "sblendid-bindings-macos";

export type Action = () => void | Promise<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type End = () => void | Promise<void>;
export type Cond<E extends Event> = Listener<E> | Params<E> | Params<E>[0];

type PromiseExecutor<T> = (
  resolve: (value?: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void
) => void;

export default class Adapter extends Bindings {
  public static withBindings(bindings: Bindings): Bindings & Adapter {
    class BoundAdapter {}
    inherits(BoundAdapter, bindings.constructor);
    inherits(BoundAdapter, Adapter);
    return new BoundAdapter() as Bindings & Adapter;
  }

  async run<E extends Event>(action: Action, when: When<E>, end?: End): Promise<Params<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  public when<E extends Event>(
    event: E,
    condition?: Cond<E>,
    timeout?: number
  ): Promise<Params<E>> {
    let listener: Listener<E>;
    return this.timeoutPromise<Params<E>>(timeout, `${event} timed out`, resolve => {
      listener = this.getConditionListener(resolve, condition);
      this.on(event, listener);
    }).finally(() => this.off(event, listener));
  }

  private timeoutPromise<T>(
    ms: number | undefined,
    message: string,
    executor: PromiseExecutor<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const error = new Error(message);
      if (typeof ms !== "undefined") setTimeout(() => reject(error), ms);
      return executor(resolve, reject);
    });
  }

  private getConditionListener<E extends Event>(
    resolve: Function,
    condition?: Cond<E>
  ): Listener<E> {
    return (async (...args: Params<E>) => {
      const conditionIsMet = await this.conditionIsMet(condition, args);
      if (conditionIsMet) resolve(args);
    }) as any;
  }

  private async conditionIsMet(condition: any, args: any[]): Promise<boolean> {
    if (typeof condition === "undefined") return true;
    if (typeof condition === "function") return await condition(...args);
    return args[0] === condition;
  }
}
 */

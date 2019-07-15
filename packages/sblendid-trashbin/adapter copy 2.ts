import { inherits } from "util";

import Bindings, {
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "../sblendid/types/bindings";

export type Action = () => void | Promise<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type End = () => void | Promise<void>;
export type Condition<E extends Event> = Listener<E> | Params<E> | Params<E>[0];

export class Adapter {
  public bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public static withBindings(
    NobleBindings: new () => Bindings
  ): Bindings & Adapter {
    class BoundAdapter {}
    inherits(BoundAdapter, NobleBindings);
    inherits(BoundAdapter, Adapter);
    return new BoundAdapter() as Bindings & Adapter;
  }

  async run<E extends Event>(
    action: Action,
    when: When<E>,
    end?: End
  ): Promise<Params<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  on<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.on(event, listener);
  }

  off<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.off(event, listener);
  }

  once<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.once(event, listener);
  }

  public when<E extends Event>(
    event: E,
    condition?: Condition<E>,
    timeout?: number
  ): Promise<Params<E>> {
    let listener: Listener<E>;
    return new Promise<Params<E>>((resolve, reject) => {
      listener = this.getConditionListener(resolve, condition);
      if (typeof timeout !== "undefined") setTimeout(reject, timeout);
      this.on(event, listener);
    }).finally(() => {
      this.off(event, listener);
    });
  }

  private getConditionListener<E extends Event>(
    resolve: Function,
    condition?: Condition<E>
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

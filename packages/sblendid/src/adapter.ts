import { Bindings, EventName as Event, EventParameters as Params } from "sblendid-bindings-macos";
import Queue from "../src/queue";

export type Action = () => Promise<void> | void;
export type When<E extends Event> = () => Promise<Params<E>>;
export type End = () => Promise<void> | void;

export type Condition<E extends Event> = ConditionFn<E> | Params<E>[0];
export type ConditionFn<E extends Event> = (params: Params<E>) => Promise<boolean> | boolean;

export default class Adapter extends Bindings {
  async run<E extends Event>(action: Action, when: When<E>, end?: End): Promise<Params<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  // todo any wtf why
  public when<E extends Event>(event: E, condition: Condition<E>): Promise<Params<E>> {
    return new Promise(resolve => {
      const queue = new Queue();
      this.on(event, (async (...params: Params<E>) => {
        const item =
          typeof condition === "function" ? () => condition(params) : condition === params[0];
        const conditionIsMet = await queue.add(item);
        if (conditionIsMet) await queue.end(() => resolve(params));
      }) as any);
    });
  }
}

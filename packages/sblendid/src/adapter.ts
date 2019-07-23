import {
  Bindings,
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "sblendid-bindings-macos";
import promisedEvent from "p-event";

export type Action = () => Promise<void> | void;
export type When<E extends Event> = () => Promise<Params<E>>;
export type End = () => Promise<void> | void;

export type Condition<E extends Event> = ConditionFn<E> | Params<E>[0];
export type ConditionFn<E extends Event> = (params: Params<E>) => boolean;

export type Filter<E extends Event> = (...args: [Params<E>]) => boolean;

export default class Adapter extends Bindings {
  async run<E extends Event>(action: Action, when: When<E>, end?: End): Promise<Params<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  // todo any wtf why
  public when<E extends Event>(event: E, condition: Condition<E>): Promise<Params<E>> {
    return new Promise(resolve => {
      this.on(event, ((...params: Params<E>) => {
        if (typeof condition === "function" && condition(params)) return resolve(params);
        if (condition === params[0]) resolve(params);
      }) as any);
    });
  }
}

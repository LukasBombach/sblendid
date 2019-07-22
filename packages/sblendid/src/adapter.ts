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

// export type Condition<E extends Event> = Listener<E> | Params<E> | Params<E>[0];

export type Filter<E extends Event> = (...args: [Params<E>]) => boolean;

export default class Adapter extends Bindings {
  async run<E extends Event>(action: Action, when: When<E>, end?: End): Promise<Params<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  // todo fucking any
  public when<E extends Event>(event: E, filter: Filter<E>): Promise<Params<E>> {
    return promisedEvent<E, Params<E>>(this as any, event, { filter, multiArgs: true } as any);
  }
}

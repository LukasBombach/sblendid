import { inherits } from "util";
import promisedEvent from "p-event";

import Bindings, {
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "../types/bindings";

export type Action = () => void | Promise<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type End = () => void | Promise<void>;
export type Condition<E extends Event> = Listener<E> | Params<E> | Params<E>[0];

export default class Adapter extends Bindings {
  private constructor() {
    super();
  }

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

  // todo fucking any
  public when<E extends Event>(event: E, filter: Condition<E>): Promise<Params<E>> {
    const multiArgs = true;
    return promisedEvent<E, Params<E>>(this as any, event, { filter, multiArgs } as any);
  }
}

import { inherits } from "util";

import { Bindings, EventName, EventListener, EventParameters } from "sblendid-bindings-macos";
import promisedEvent from "p-event";

export type Action = () => Promise<void> | void;
export type When<E extends EventName> = () => Promise<EventParameters<E>>;
export type End = () => Promise<void> | void;

export type Condition<E extends EventName> =
  | EventListener<E>
  | EventParameters<E>
  | EventParameters<E>[0];

export default class Adapter extends Bindings {
  /* public static withBindings(bindings: Bindings): Bindings & Adapter {
    class BoundAdapter {}
    inherits(BoundAdapter, bindings.constructor);
    inherits(BoundAdapter, Adapter);
    return new BoundAdapter() as Bindings & Adapter;
  } */

  async run<E extends EventName>(
    action: Action,
    when: When<E>,
    end?: End
  ): Promise<EventParameters<E>> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (end) await end();
    return eventParameters;
  }

  // todo fucking any
  public when<E extends EventName>(event: E, filter?: Condition<E>): Promise<EventParameters<E>> {
    const multiArgs = true;
    //const filter = condidion
    return promisedEvent<E, EventParameters<E>>(this as any, event, { filter, multiArgs } as any);
  }
}

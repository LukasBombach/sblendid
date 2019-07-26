import {
  Bindings,
  EventName as Event,
  EventParameters as Params,
  EventListener as Listener
} from "sblendid-bindings-macos";
import Queue from "../src/queue";
import Peripheral from "./peripheral";

export type Action = () => Promise<void> | void;
export type When<E extends Event> = () => Promise<Params<E>>;
export type Post<E extends Event, R> = (params: Params<E>) => Promise<R | void> | R | void;
type P<E extends Event> = Params<E>;

export type Condition<E extends Event> = ConditionFn<E> | Params<E>[0];
export type ConditionFn<E extends Event> = (params: Params<E>) => Promise<boolean> | boolean;
export type AsPeripheralListener = (peripheral: Peripheral) => Promise<void | boolean> | void | boolean;

export default class Adapter extends Bindings {
  async run<E extends Event, R = P<E>>(action: Action, when: When<E>, ...posts: Post<E, R>[]): Promise<R> {
    const [eventParameters] = await Promise.all([when(), action()]);
    for (const post of posts.slice(0, posts.length - 1)) await post(eventParameters);
    const lastPostReturn = posts.length ? await posts.pop()!(eventParameters) : undefined;
    return typeof lastPostReturn !== "undefined" ? lastPostReturn : ((eventParameters as any) as R);
  }

  public when<E extends Event>(event: E, condition: Condition<E>): Promise<Params<E>> {
    return new Promise(resolve => {
      const queue = new Queue();
      this.on(event, (async (...params: Params<E>) => {
        const item = typeof condition === "function" ? () => condition(params) : condition === params[0];
        const conditionIsMet = await queue.add(item);
        if (conditionIsMet) await queue.end(() => resolve(params));
      }) as any);
    });
  }
}

export function asPeripheral(listener: AsPeripheralListener): Listener<"discover"> {
  return (...args: Params<"discover">) => listener(new Peripheral(this.adapter, ...args));
}

/*
async run<E extends Event>(
    action: Action,
    when: When<E>,
    end?: End<E>,
    transform?: End<E>
  ): Promise<any> {
    const [eventParameters] = await Promise.all([when(), action()]);
    const endReturn = end ? await end(eventParameters) : eventParameters;
    return transform ? await transform(endReturn) : endReturn;
  }
*/

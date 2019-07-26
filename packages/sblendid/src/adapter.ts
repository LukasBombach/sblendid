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
export type End<E extends Event> = (params: Params<E>) => Promise<any> | any;
export type Post = (params: any) => Promise<any> | any;

export type Condition<E extends Event> = ConditionFn<E> | Params<E>[0];
export type ConditionFn<E extends Event> = (params: Params<E>) => Promise<boolean> | boolean;
export type AsPeripheralListener = (
  peripheral: Peripheral
) => Promise<void | boolean> | void | boolean;

export default class Adapter extends Bindings {
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

  async run2<E extends Event>(action: Action, when: When<E>, ...post: Post[]): Promise<any> {
    const [eventParameters] = await Promise.all([when(), action()]);
    if (post)
      return post.reduce((a, b) => (params: any[]) => {
        const args = params ? params : eventParameters;
        a(b(args));
      });
    return eventParameters;
  }

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

export function asPeripheral(listener: AsPeripheralListener): Listener<"discover"> {
  return (...args: Params<"discover">) => listener(new Peripheral(this.adapter, ...args));
}

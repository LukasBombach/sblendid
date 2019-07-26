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
export type ConditionFn<E extends Event> = (params: Params<E>) => Promise<void | boolean> | void | boolean;
export type AsPeripheralListener = (peripheral: Peripheral) => Promise<void | boolean> | void | boolean;

type Resolve = (value?: unknown) => void;
type Reject = (reason?: any) => void;

interface CallbacksObject {
  resolve: Resolve;
  reject: Reject;
}

interface PromiseObject<T> {
  promise: Promise<T>;
}

interface PromiseAnQueue<T> extends PromiseObject<T> {
  queue: Queue;
}

export default class Adapter extends Bindings {
  async run<E extends Event, R = P<E>>(action: Action, when: When<E>, ...posts: Post<E, R>[]): Promise<R> {
    const [eventParameters] = await Promise.all([when(), action()]);
    for (const post of posts.slice(0, posts.length - 1)) await post(eventParameters);
    const lastPostReturn = posts.length ? await posts.pop()!(eventParameters) : undefined;
    return typeof lastPostReturn !== "undefined" ? lastPostReturn : ((eventParameters as any) as R);
  }

  public when<E extends Event>(event: E, condition: Condition<E>): Promise<Params<E>> {
    const { promise, resolve, queue } = this.setUpWhen<Params<E>>();
    this.on(event, ((...params: Params<E>) => this.onWhenEvent(condition, params, queue, resolve)) as any);
    return promise;
  }

  public asPeripheral(listener: AsPeripheralListener): ConditionFn<"discover"> {
    return (...args: Params<"discover">) => listener(Peripheral.fromDiscover(this, args));
  }

  private async onWhenEvent<E extends Event>(cond: Condition<E>, params: Params<E>, q: Queue, res: Resolve) {
    const conditionIsMet = await q.add(this.getQueueItem(cond, params));
    if (conditionIsMet) await q.end(() => res(params));
  }

  private setUpWhen<T>(): CallbacksObject & PromiseAnQueue<T> {
    const callbacks: CallbacksObject = { resolve: () => {}, reject: () => {} };
    const promise = new Promise<T>((resolve, reject) => Object.assign(callbacks, { resolve, reject }));
    return Object.assign<CallbacksObject, PromiseAnQueue<T>>(callbacks, { promise, queue: new Queue() });
  }

  private async getQueueItem<E extends Event>(cond: Condition<E>, params: Params<E>): Promise<any> {
    return typeof cond === "function" ? () => cond(params) : cond === params[0];
  }
}

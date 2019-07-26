import { Bindings, EventName, EventParameters } from "sblendid-bindings-macos";
import Queue from "../src/queue";
import Peripheral from "./peripheral";

export type Action = () => Promish<void>;
export type When<E extends EventName> = () => Promise<EventParameters<E>>;
export type Post<E extends EventName, ReturnValue> = (
  params: EventParameters<E>
) => Promish<ReturnValue | void>;

export type PeripheralListener = (
  peripheral: Peripheral
) => Promish<void | boolean>;

export default class Adapter extends Bindings {
  async run<E extends EventName, ReturnValue = EventParameters<E>>(
    action: Action,
    when: When<E>,
    ...posts: Post<E, ReturnValue>[]
  ): Promise<ReturnValue> {
    const [eventParameters] = await Promise.all([when(), action()]);

    for (const post of posts.slice(0, posts.length - 1)) {
      await post(eventParameters);
    }

    const lastPostReturn = posts.length
      ? await posts.pop()!(eventParameters)
      : undefined;

    return typeof lastPostReturn !== "undefined"
      ? lastPostReturn
      : ((eventParameters as any) as ReturnValue);
  }

  public whens<E extends EventName>(
    event: E,
    condition: Condition<E>
  ): Promise<EventParameters<E>> {
    return new Promise(resolve => {
      const queue = new Queue();
      this.on(event, async (...params: EventParameters<E>) => {
        const conditionIsMet = await queue.add(this.getQueueItem(cond, params));
        if (conditionIsMet) await queue.end(() => resolve(params));
      });
    });
  }

  public asPeripheral(listener: PeripheralListener): ConditionFn<"discover"> {
    return (...args: EventParameters<"discover">) =>
      listener(Peripheral.fromDiscover(this, args));
  }

  private async getQueueItem<E extends EventName>(
    cond: Condition<E>,
    params: EventParameters<E>
  ): Promise<any> {
    return typeof cond === "function" ? () => cond(params) : cond === params[0];
  }
}

/*

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
  public when<E extends EventName>(
    event: E,
    condition: Condition<E>
  ): Promise<EventParameters<E>> {
    const { promise, resolve, queue } = this.setUpWhen<EventParameters<E>>();
    this.on(event, ((...params: EventParameters<E>) =>
      this.onWhenEvent(condition, params, queue, resolve)) as any);
    return promise;
  }

  private setUpWhen<T>(): CallbacksObject & PromiseAnQueue<T> {
    const callbacks: CallbacksObject = { resolve: () => {}, reject: () => {} };
    const promise = new Promise<T>((resolve, reject) =>
      Object.assign(callbacks, { resolve, reject })
    );
    const promiseAndQueue: PromiseAnQueue<T> = { promise, queue: new Queue() };
    return Object.assign(callbacks, promiseAndQueue);
  }



  private async onWhenEvent<E extends EventName>(
    cond: Condition<E>,
    params: EventParameters<E>,
    q: Queue,
    res: Resolve
  ) {
    const conditionIsMet = await q.add(this.getQueueItem(cond, params));
    if (conditionIsMet) await q.end(() => res(params));
  }
*/

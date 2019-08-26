import Bindings, { Event, Params, Listener, Promish } from "./types/bindings";
import Queue from "./queue";

export type Action = () => Promish<void>;
export type When<E extends Event> = () => Promise<Params<E>>;
export type Post<E extends Event, ReturnValue = Params<E>> = (
  params: Params<E>
) => Promish<ReturnValue | void>;

export default class Adapter {
  public bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  async run<E extends Event, ReturnValue = Params<E>>(
    action: Action,
    when: When<E>,
    ...posts: Post<E, ReturnValue>[]
  ): Promise<ReturnValue> {
    const [params] = await Promise.all([when(), action()]);
    const cleanupMethods = posts.slice(0, -1);
    const returnMethod = posts.slice(-1).pop();
    for (const post of cleanupMethods) await post(params);
    const returnMethodValue = returnMethod && (await returnMethod(params));
    return (typeof returnMethodValue !== "undefined"
      ? returnMethodValue
      : params) as ReturnValue;
  }

  public when<E extends Event>(
    event: E,
    condition: Listener<E>
  ): Promise<Params<E>> {
    return new Promise<Params<E>>(resolve => {
      const queue = new Queue();
      const listener = async (...params: Params<E>) => {
        const conditionIsMet = await queue.add(() => condition(...params));
        if (conditionIsMet) await queue.end(() => resolve(params));
        if (conditionIsMet) this.bindings.off(event, listener);
      };
      this.bindings.on(event, listener);
    });
  }
}

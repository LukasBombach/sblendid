import { EventApi } from "../types/dbus";

type GetApi<E extends EventApi<any>> = E extends EventApi<infer T> ? T : never;
type Event<E extends EventApi<any>> = keyof GetApi<E>["events"];
type Listener<E extends EventApi<any>, K extends Event<E>> = GetApi<
  E
>["events"][K];
type Value<E extends EventApi<any>, K extends Event<E>> = Parameters<
  Listener<E, K>
>;
type Condition<E extends EventApi<any>, K extends Event<E>> = (
  ...args: Value<E, K>
) => Promise<boolean> | boolean;
type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void;

export default class Watcher<A extends EventApi<any>, E extends Event<A>> {
  private emitter: A;
  private event: E;
  private listener: Listener<A, E>;
  private promise: Promise<Value<A, E>>;
  private resolve!: Resolver<Value<A, E>>;

  constructor(emitter: A, event: E, condition: Condition<A, E>) {
    this.emitter = emitter;
    this.event = event;
    this.listener = (...args: Value<A, E>) => {
      if (condition(...args)) this.resolve(args);
    };
    this.promise = new Promise<Value<A, E>>(res => this.setResolver(res)).then(
      val => this.stopListening(val)
    );
    this.startListening();
  }

  public resolved(): Promise<Value<A, E>> {
    return this.promise;
  }

  private startListening(): void {
    this.emitter.on(this.event, this.listener);
  }

  private stopListening(val: Value<A, E>): Value<A, E> {
    this.emitter.off(this.event, this.listener);
    return val;
  }

  private setResolver(resolve: Resolver<Value<A, E>>): void {
    this.resolve = resolve;
  }
}

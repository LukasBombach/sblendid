import Emitter, { Events, Listener, Value } from "../types/emitter";

export type Condition<E extends Emitter<any>, K extends Events<E>> = (
  ...args: Value<E, K>
) => Promise<boolean> | boolean;
export type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void;

export default class Watcher<E extends Emitter<any>, K extends Events<E>> {
  private emitter: E;
  private event: K;
  private listener: Listener<E, K>;
  private promise: Promise<Value<E, K>>;
  private resolve!: Resolver<Value<E, K>>;

  constructor(emitter: E, event: K, condition: Condition<E, K>) {
    this.emitter = emitter;
    this.event = event;
    this.listener = (...args: Value<E, K>) => {
      if (condition(...args)) this.resolve(args);
    };
    this.promise = new Promise<Value<E, K>>(res => this.setResolver(res)).then(
      val => this.stopListening(val)
    );
    this.startListening();
  }

  public resolved(): Promise<Value<E, K>> {
    return this.promise;
  }

  private startListening(): void {
    this.emitter.on(this.event, this.listener);
  }

  private stopListening(val: Value<E, K>): Value<E, K> {
    this.emitter.off(this.event, this.listener);
    return val;
  }

  private setResolver(resolve: Resolver<Value<E, K>>): void {
    this.resolve = resolve;
  }
}

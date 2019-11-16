import Emitter, { Events, Listener, Value } from "../types/emitter";
import Queue from "./queue";

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
  private queue = new Queue();

  constructor(emitter: E, event: K, condition: Condition<E, K>) {
    this.emitter = emitter;
    this.event = event;
    this.listener = async (...args: Value<E, K>) => {
      const conditionIsMet = await this.queue.add(() => condition(...args));
      if (conditionIsMet) this.resolve(args);
    };
    this.promise = new Promise<Value<E, K>>(res => this.setResolver(res)).then(
      async val => {
        await this.queue.end();
        this.emitter.off(this.event, this.listener);
        return val;
      }
    );
    this.startListening();
  }

  public resolved(): Promise<Value<E, K>> {
    return this.promise;
  }

  private startListening(): void {
    this.emitter.on(this.event, this.listener);
  }

  private setResolver(resolve: Resolver<Value<E, K>>): void {
    this.resolve = resolve;
  }
}

/* interface Api {
  num: (param: number) => void;
  bool: (param: boolean) => void;
}

class X extends Emitter<Api> {
  public on<E extends Events<Emitter<Api>>>(
    event: E,
    listener: Listener<Emitter<Api>, E>
  ): void {}
  public off<E extends Events<Emitter<Api>>>(
    event: E,
    listener: Listener<Emitter<Api>, E>
  ): void {}
}

const x = new X();

x.on("num", n => {});
x.off("bool", b => {});
x.off("foo", f => {});

const watcher = new Watcher<Emitter<Api>, "num">(x, "num", () => true);

const res = watcher.resolved(); */

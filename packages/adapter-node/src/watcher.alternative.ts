import Emitter, { Events, Listener /* , Value */ } from "../types/emitter";
import ObjectManager from "./linux/objectManager";
export type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void;

type Value<E extends {}, K extends keyof E> = E[K] extends (...args: any) => any
  ? Parameters<E[K]>
  : never;

export type Condition<E extends {}, K extends keyof E> = (
  ...args: Value<E, K>
) => Promise<boolean> | boolean;

export default class Watcher<E extends {}, K extends keyof E> {
  public emitter: Emitter<E>;
  private event: K;
  private listener: E[K];
  private promise: Promise<Value<E, K>>;
  private resolve!: Resolver<Value<E, K>>;
  constructor(emitter: Emitter<E>, event: K, condition: Condition<E, K>) {
    this.emitter = emitter;
    this.event = event;
    this.listener = (...args: Value<E, K>) => {
      if (condition(...args)) this.resolve(args);
    };
    this.promise = new Promise<Value<E, K>>(res =>
      this.setResolver(res)
    ).then(val => this.stopListening(val));
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

interface Api {
  num: (param: number) => void;
  bool: (param: boolean) => void;
}

class X {
  public on<K extends keyof Api>(event: K, listener: Api[K]): void {}
  public off<K extends keyof Api>(event: K, listener: Api[K]): void {}
}

const x = new X();

x.on("num", n => {});
x.off("bool", b => {});
x.off("foo", f => {});

const watcher = new Watcher<Api, "num">(x, "num", () => true);
watcher.emitter;

/* export type Condition<E extends Emitter<any>, K extends Events<E>> = (
  ...args: Value<E, K>
) => Promise<boolean> | boolean; */

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
  private condition: Condition<E, K>;
  private queue = new Queue();

  constructor(emitter: E, event: K, condition: Condition<E, K>) {
    /* this.emitter = emitter;
    this.event = event;
    this.listener = this.getListener(condition);
    this.emitter.on(this.event, this.listener); */
    //
    // Create a Promise
    // Setup Listener for the event
    //   If the listener finds an event matching the condition
    //     resolve the Promise
    //     stop listening
    // start listening
    /* const promise = new Promise(res => (this.resolve = res));
    this.emitter = emitter;
    this.condition = condition;
    this.listener = (...args: Value<E, K>) => this.resolveIfCondition(args);
    this.promise = promise.then()
    this.emitter.on(event, this.listener); */

    this.promise = new Promise(res => {
      const listener = async (...args: Value<E, K>) => {
        const conditionIsMet = await this.queue.add(() => condition(...args));
        if (conditionIsMet) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }

  public resolved(): Promise<Value<E, K>> {
    return this.promise;
  }

  private async resolveIfCondition(args: Value<E, K>) {
    const conditionIsMet = await this.queue.add(() => this.condition(...args));
    if (conditionIsMet) this.resolve(args);
  }

  /* private getListener() {
    return async (...args: Value<E, K>) => this.resolveIfConditionIsMet(args);
  } */

  /* private startListening(): void {
    this.emitter.on(this.event, this.listener);
  } */

  private setResolver(resolve: Resolver<Value<E, K>>): void {
    this.resolve = resolve;
  }

  private async endQueue(val: Value<E, K>): Promise<Value<E, K>> {
    await this.queue.end();
    return val;
  }

  private async stopListening(val: Value<E, K>): Promise<Value<E, K>> {
    this.emitter.off(this.event, this.listener);
    return val;
  }

  /*
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
  */

  /* private setupPromise(): void {
    const promise = new Promise<Value<E, K>>(res => (this.resolve = res));
    this.promise = promise.then;
  } */
}

/* private getPromise(): {
    promise: Promise<Value<E, K>>;
    resolve: Resolver<Value<E, K>>;
  } {
    let resolve: Resolver<Value<E, K>>;
    const promise = new Promise<Value<E, K>>(res => (resolve = res));
    return { promise, resolve };
  }
} */

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

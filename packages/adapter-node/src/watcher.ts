import Queue from "./queue";

type OnOffFn<E, L extends (...args: any[]) => any> = (
  event: E,
  listener: L
) => any;
type OnEmitter<E, L extends (...args: any[]) => any> = {
  on: OnOffFn<E, L>;
  off: OnOffFn<E, L>;
};

type GetEvent<A extends OnEmitter<any, any>> = A extends OnEmitter<infer T, any>
  ? T
  : never;

type GetValue<A extends OnEmitter<any, any>> = A extends OnEmitter<any, infer T>
  ? Parameters<T>
  : never;

type Condition<A extends OnEmitter<any, any>> = (
  ...args: GetValue<A>
) => Promise<boolean> | boolean;

export default class Watcher<
  A extends OnEmitter<any, any>,
  E extends GetEvent<A>
> {
  private promise: Promise<GetValue<A>>;
  private queue = new Queue();

  constructor(emitter: A, event: E, condition: Condition<A>) {
    this.promise = new Promise(res => {
      const listener = async (...args: GetValue<A>) => {
        if (await this.isMet(condition, args)) {
          emitter.off(event, listener);
          res(args);
        }
      };
      emitter.on(event, listener);
    });
  }

  public resolved(): Promise<GetValue<A>> {
    return this.promise;
  }

  private async isMet(
    condition: Condition<A>,
    args: GetValue<A>
  ): Promise<boolean> {
    return await this.queue.add(() => condition(...args));
  }
}

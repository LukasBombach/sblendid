export interface Emitter<A extends {}> {
  on: <E extends keyof A>(event: E, listener: A[E]) => any;
  off: <E extends keyof A>(event: E, listener: A[E]) => any;
}

export type GetApi<E extends Emitter<any>> = E extends Emitter<infer T>
  ? T
  : never;

export type Event<A extends {}> = keyof A;

export interface Api {
  discover: (str: string) => void;
  service: (num: number) => void;
}

export default class Watcher<A extends {}, E extends keyof A> {
  constructor(emitter: Emitter<A>, event: E, condition: Condition<A, E>) {}

  public resolved(): Promise<Value<M, E>> {
    return null as any;
  }
}

class ObjectManager implements Emitter<Api> {
  on<E extends keyof Api>(event: E, listener: Api[E]): void {}
  off<E extends keyof Api>(event: E, listener: Api[E]): void {}
}

const objectManager = new ObjectManager();

objectManager.on("discover", str => console.log(str));
objectManager.off("service", num => console.log(num));

const watcher = new Watcher(new ObjectManager(), "discover", () => true);

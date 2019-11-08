import { EventApi } from "../types/dbus";
import { ObjectManager } from "../types/bluez";

interface EventEmitter<A = EventApi<any>> {
  on: <E extends keyof A>(event: E, listener: A[E]) => void;
  off: <E extends keyof A>(event: E, listener: A[E]) => void;
}

type Events<E extends EventEmitter> = Parameters<E["on"]>[0];
type Condition = (...args: any[]) => Promise<boolean> | boolean;
type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void;

/* 

type Listener<EE extends EventEmitter, E extends Events<EE>> = Parameters<
  EE["on"]
>[1];

type Value = Parameters<Listener<ObjectManager, "InterfacesAdded">>;

type MngrEvents = Events<ObjectManager>;
type MngrListener = Listener<ObjectManager, "InterfacesAdded">; */

export default class Watcher<E extends EventEmitter> {
  private eventEmitter: E;
  private event: Events<E>;
  private listener: (...args: T) => void;
  private promise: Promise<T>;
  private resolve!: Resolver<T>;

  constructor(eventEmitter: E, event: Events<E>, condition: Condition) {
    this.eventEmitter = eventEmitter;
    this.event = event;
    this.listener = (...args: T) => {
      if (condition(...args)) this.resolve(args);
    };
    this.promise = new Promise<T>(res => this.setResolver(res)).then(val =>
      this.stopListening(val)
    );
    this.startListening();
  }

  public resolved(): Promise<T> {
    return this.promise;
  }

  private startListening(): void {
    this.eventEmitter.on(this.event, this.listener);
  }

  private stopListening(val: T): T {
    this.eventEmitter.off(this.event, this.listener);
    return val;
  }

  private setResolver(resolve: Resolver<T>): void {
    this.resolve = resolve;
  }
}

const mngr = {} as ObjectManager;

async () => {
  const watcher0 = new Watcher(mngr, "as", () => true);
  const watcher = new Watcher(mngr, "InterfacesAdded", () => true);

  const val = await watcher.resolved();

  console.log(watcher0, watcher, val);
};

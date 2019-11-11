// type Events<E extends EventEmitter> = Parameters<E["on"]>[0];
// type Value<EE extends EventEmitter, E extends keyof EE> =

// type Listener<EE extends EventEmitter, E extends Events<EE>> = Parameters<
//   EE["on"]
// >[1];
// type Value = Parameters<Listener<ObjectManager, "InterfacesAdded">>;
// type MngrEvents = Events<ObjectManager>;
// type MngrListener = Listener<ObjectManager, "InterfacesAdded">;

/* interface EventEmitter<A = EventApi<any>> {
  on: <E extends keyof A>(event: E, listener: A[E]) => void;
  off: <E extends keyof A>(event: E, listener: A[E]) => void;
} */

/* type EventEmitter = EventApi<any>;

type GetApi<E extends EventEmitter> = E extends EventEmitter<infer T>
  ? T
  : never; */
/* type Events<E extends EventEmitter> = keyof GetApi<E>;
type Value<E extends EventEmitter, K extends Events<E>> = GetApi<E>[K];
type Condition = (...args: any[]) => Promise<boolean> | boolean;
type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void; */

const mngr = {} as ObjectManager;

async () => {
  const watcher0 = new Watcher(mngr, "as", () => true);
  const watcher = new Watcher(mngr, "InterfacesAdded", () => true);

  const val = await watcher.resolved();

  console.log(watcher0, watcher, val);
};

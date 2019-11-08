interface Callbacks {
  InterfacesAdded: (path: string, interfaces: number) => void;
  Yadoodle: (bool: boolean) => void;
}

// type On = <E extends keyof Callbacks>(event: E, listener: Callbacks[E]) => void;

interface EventEmitter<A = Callbacks> {
  on: <E extends keyof A>(event: E, listener: A[E]) => void;
  off: <E extends keyof A>(event: E, listener: A[E]) => void;
}

type Events<E extends EventEmitter> = Parameters<E["on"]>[0];

const x: Events<Callbacks> = "";

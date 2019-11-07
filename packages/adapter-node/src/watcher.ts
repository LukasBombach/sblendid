interface EventEmitter {
  on: (event: string, listener: Function) => any;
  off: (event: string, listener: Function) => any;
}

type Condition = (...args: any[]) => Promise<boolean> | boolean;

export default class Watcher<T> {
  constructor(
    eventEmitter: EventEmitter,
    event: string,
    condition: Condition
  ) {}

  public resolved(): Promise<T> {}
}

interface EventEmitter {
  on: (event: string, listener: Function) => any;
  off: (event: string, listener: Function) => any;
}

type Condition = (...args: any[]) => Promise<boolean> | boolean;
type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void;

export default class Watcher<T extends any[]> {
  private eventEmitter: EventEmitter;
  private event: string;
  private listener: (...args: T) => void;
  private promise: Promise<T>;
  private resolve!: Resolver<T>;

  constructor(eventEmitter: EventEmitter, event: string, condition: Condition) {
    this.eventEmitter = eventEmitter;
    this.event = event;
    this.listener = (...args: T) => condition(...args) && this.resolve(args);
    this.promise = new Promise<T>(this.setResolver).then(this.stopListening);
    this.startListening();
  }

  public resolved(): Promise<T> {
    return this.promise;
  }

  private startListening(): void {
    this.eventEmitter.on(this.event, this.listener);
  }

  private stopListening(args: T): T {
    this.eventEmitter.off(this.event, this.listener);
    return args;
  }

  private setResolver(resolve: Resolver<T>): void {
    this.resolve = resolve;
  }
}

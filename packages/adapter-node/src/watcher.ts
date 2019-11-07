interface EventEmitter {
  on: (event: any, listener: Function) => any; // todo uncool any
  off: (event: any, listener: Function) => any; // todo uncool any
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
    this.listener = (...args: T) => {
      console.log("got event", args);
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
    console.log("starting to listen", this.event);
    this.eventEmitter.on(this.event, this.listener);
  }

  private stopListening(val: T): T {
    console.log("stopping listening");
    this.eventEmitter.off(this.event, this.listener);
    return val;
  }

  private setResolver(resolve: Resolver<T>): void {
    this.resolve = resolve;
  }
}

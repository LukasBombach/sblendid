export interface EventEmitter {
  on: (event: string, listener: (...args: any[]) => void) => void;
  off: (event: string, listener: (...args: any[]) => void) => void;
}

export type Condition = (...args: any[]) => Promish<boolean>;

export default class Watcher {
  private eventEmitter: EventEmitter;
  private event: string;
  private condition: Condition;

  constructor(eventEmitter: EventEmitter, event: string, condition: Condition) {
    this.eventEmitter = eventEmitter;
    this.event = event;
    this.condition = condition;
  }

  async resolved(): Promise<any> {}
}

import Bindings, {
  EventName,
  EventListener,
  EventParameters
} from "../types/bindings";

export type Condition<E extends EventName> =
  | EventListener<E>
  | EventParameters<E>[0];

export default class Adapter {
  public bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  on<E extends EventName>(event: E, listener: EventListener<E>): void {
    this.bindings.on(event, listener);
  }

  off<E extends EventName>(event: E, listener: EventListener<E>): void {
    this.bindings.off(event, listener);
  }

  once<E extends EventName>(event: E, listener: EventListener<E>): void {
    this.bindings.once(event, listener);
  }

  public when<E extends EventName>(
    event: E,
    condition?: Condition<E>,
    timeout?: number
  ): Promise<EventParameters<E>> {
    let listener: EventListener<E>;
    return new Promise<EventParameters<E>>((resolve, reject) => {
      listener = this.getConditionListener(resolve, condition);
      if (typeof timeout !== "undefined") setTimeout(reject, timeout);
      this.on(event, listener);
    }).finally(() => {
      this.off(event, listener);
    });
  }

  private getConditionListener<E extends EventName>(
    resolve: Function,
    condition?: Condition<E>
  ): EventListener<E> {
    return (async (...args: EventParameters<E>) => {
      const conditionIsMet = await this.conditionIsMet(condition, args);
      if (conditionIsMet) resolve(args);
    }) as any;
  }

  private async conditionIsMet(condition: any, args: any[]): Promise<boolean> {
    if (typeof condition === "undefined") return true;
    if (typeof condition === "function") return await condition(...args);
    return args[0] === condition;
  }
}

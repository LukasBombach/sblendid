import Bindings, { EventName, EventListener } from "../types/bindings";

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

  // todo any
  public when<E extends EventName>(
    event: E,
    condition?: any,
    timeout?: number
  ): Promise<any> {
    let listener: EventListener<E>;
    return new Promise((resolve, reject) => {
      listener = async (...args: any[]) => {
        const conditionIsMet = await this.conditionIsMet(condition, args);
        if (conditionIsMet) resolve(args);
      };
      if (typeof timeout !== "undefined") global.setTimeout(reject, timeout);
      this.on(event, listener);
    }).finally(() => {
      this.off(event, listener);
    });
  }

  private async conditionIsMet(condition: any, args: any[]): Promise<boolean> {
    if (typeof condition === "undefined") return true;
    if (typeof condition === "function") return await condition(...args);
    return args[0] === condition;
  }
}

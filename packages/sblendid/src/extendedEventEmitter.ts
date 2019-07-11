//import { EventEmitter } from "events";
import { EventEmitter } from "tsee";
import { NobleAdapterEvents } from "../types/nobleAdapter";

export default class ExtendedEventEmitter extends EventEmitter<
  NobleAdapterEvents
> {
  // todo 2nd parameter must be typed
  // todo return type must be typed
  public when(
    event: keyof NobleAdapterEvents,
    condition: any,
    timeout?: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const listener = async (...args: any[]) => {
        const conditionHasMet =
          typeof condition === "function"
            ? await condition(...args)
            : args[0] === condition;
        if (conditionHasMet) {
          this.off(event, listener);
          resolve();
        }
      };
      this.on(event, listener);
      if (typeof timeout !== "undefined") {
        global.setTimeout(() => {
          this.off(event, listener);
          reject();
        }, timeout);
      }
    });
  }

  private timeout(action: string, ms?: number, cleanUp?: Function): void {
    if (typeof ms === "undefined") return;
    global.setTimeout(() => {
      if (cleanUp) cleanUp();
      throw new Error(`Timeout: Could not ${action} after ${ms}ms`);
    }, ms);
  }
}

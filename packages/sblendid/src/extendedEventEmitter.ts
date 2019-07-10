import { EventEmitter } from "events";

export default class ExtendedEventEmitter extends EventEmitter {
  public when(
    event: string | symbol,
    condition: any,
    timeout?: number
  ): Promise<void> {
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

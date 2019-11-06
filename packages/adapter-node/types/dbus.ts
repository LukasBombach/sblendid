declare module "dbus" {
  export interface DBusInterface {
    getProperty(
      name: string,
      callback: (err: Error, name: string) => void
    ): void;
    object: {
      method: Record<string, any>;
    };
    [methodName: string]: (...args: any[]) => void;
  }
}

export interface InputApi {
  methods?: Record<string, (...args: any[]) => Promise<any>>;
  events?: Record<string, (...args: any[]) => void>;
}
export type OutputApi<A extends InputApi> = EventApi<A> & MethodApi<A>;
export type MethodApi<A extends InputApi> = A["methods"];
export interface EventApi<A extends InputApi> {
  on: EventMethod<A>;
  off: EventMethod<A>;
}
export type EventMethod<A extends InputApi> = <E extends keyof A["events"]>(
  event: E,
  listener: A["events"][E]
) => void;

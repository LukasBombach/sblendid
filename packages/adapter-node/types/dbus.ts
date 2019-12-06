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

export interface ApiDefinition {
  methods?: Record<string, (...args: any[]) => Promise<any>>;
  events?: Record<string, (...args: any[]) => void>;
  properties?: Record<string, any>;
}

export type InterfaceApi<A extends ApiDefinition> = EventApi<A> &
  GetPropertyApi<A> &
  MethodApi<A>;

export type MethodApi<A extends ApiDefinition> = A["methods"];

export interface GetPropertyApi<A extends ApiDefinition> {
  getProperty: <N extends keyof A["properties"]>(
    name: N
  ) => Promise<A["properties"][N]>;
  getProperties: () => Promise<A["properties"]>;
}

export interface EventApi<A extends ApiDefinition> {
  on: EventMethod<A>;
  off: EventMethod<A>;
}
export type EventMethod<A extends ApiDefinition> = <
  E extends keyof A["events"]
>(
  event: E,
  listener: A["events"][E]
) => void;

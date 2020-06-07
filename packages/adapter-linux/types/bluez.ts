export interface AdapterInterface {
  name: "org.bluez.Adapter1";
  events: {};
  properties: {};
  methods: {
    StartDiscovery: (callback: (err: Error | null) => void) => void;
    StopDiscovery: (callback: (err: Error | null) => void) => void;
  };
}

export type BluezInterfaces = AdapterInterface;

export type Name<T extends BluezInterfaces> = T["name"];

export type Events<T extends BluezInterfaces> = T["events"];

export type EventName<T extends BluezInterfaces> = keyof T["events"];

export type EventCallback<
  T extends BluezInterfaces,
  E extends EventName<T>
> = T["events"][E];

export type Methods<T extends BluezInterfaces> = T["methods"];

export type MethodName<T extends BluezInterfaces> = keyof T["methods"];

export type Method<
  T extends BluezInterfaces,
  M extends MethodName<T>
> = T["methods"][M];

export type MethodParameters<
  T extends BluezInterfaces,
  M extends MethodName<T>
> = Method<T, M> extends (...args: infer P) => any ? P : never;

export type PromisedParams = Parameters<
  Promisify<Method<BluezInterfaces, MethodName<BluezInterfaces>>>
>;

const x: PromisedParams = "x" as any;

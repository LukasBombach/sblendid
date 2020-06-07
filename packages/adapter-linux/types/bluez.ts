export type BluezInterfaces = [
  {
    name: "org.bluez.Adapter1";
    events: {};
    properties: {};
    methods: {
      StartDiscovery(callback: (err: Error | null) => void): void;
      StopDiscovery(callback: (err: Error | null) => void): void;
    };
  }
];

export type BluezInterface = OneOf<BluezInterfaces>;

export type Name<T extends BluezInterface> = T["name"];

export type Events<T extends BluezInterface> = T["events"];

export type EventName<T extends BluezInterface> = keyof T["events"];

export type EventCallback<
  T extends BluezInterface,
  E extends EventName<T>
> = T["events"][E];

export type Methods<T extends BluezInterface> = T["methods"];

export type MethodName<T extends BluezInterface> = keyof T["methods"];

export type Method<
  T extends BluezInterface,
  M extends MethodName<T>
> = T["methods"][M];

export type MethodParameters<
  T extends BluezInterface,
  M extends MethodName<T>
> = Method<T, M> extends (...args: infer P) => any ? P : never;

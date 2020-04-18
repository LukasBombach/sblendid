declare module "dbus" {
  export type busType = "session" | "system";
  export type Callback<V> = (err: Error, value: V) => void;
  export type Methods = Record<string, (...args: any[]) => void>;
  export type Events = Record<string, any[]>;

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface<I extends InterfaceApi>(
      serviceName: string,
      objectPath: string,
      interfaceName: string,
      callback: Callback<DBusInterface<I>>
    ): void;
    disconnect(): void;
  }

  export type InterfaceApi<
    M extends Methods = {},
    E extends Events = {},
    P extends {} = {}
  > = {
    on: <K extends keyof E>(name: K, listener: (value: E[K]) => void) => void;
    off: <K extends keyof E>(name: K, listener: (value: E[K]) => void) => void;
    getProperty: <K extends keyof P>(name: K) => Promise<P[K]>;
  } & Promisified<M>;

  /*
    M extends Methods = {},
    E extends Events = {},
    P extends {} = {}
  */

  export type GetMethodsDB<
    I extends DBusInterface<InterfaceApi>
  > = I extends DBusInterface<infer A> ? GetMethods<A> : never;

  export type GetMethods<I extends InterfaceApi> = I extends InterfaceApi<
    infer M
  >
    ? M
    : never;

  export type GetEvents<I extends InterfaceApi> = I extends InterfaceApi<
    any,
    infer E
  >
    ? E
    : never;

  export type GetProperties<I extends InterfaceApi> = I extends InterfaceApi<
    any,
    any,
    infer P
  >
    ? P
    : never;

  export type DBusInterface<I extends InterfaceApi> = {
    object: {
      method: Record<keyof GetMethods<I>, unknown>;
    };
    getProperty: <K extends keyof GetProperties<I>>(
      name: K,
      callback: Callback<GetProperties<I>[K]>
    ) => void;
    on: <K extends keyof GetEvents<I>>(
      name: K,
      listener: (value: GetEvents<I>[K]) => void
    ) => void;
    off: <K extends keyof GetEvents<I>>(
      name: K,
      listener: (value: GetEvents<I>[K]) => void
    ) => void;
  } & GetMethods<I>;
}

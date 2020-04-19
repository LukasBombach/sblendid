export type Methods = Record<string, (...args: any[]) => void>;
export type Events = Record<string, any[]>;

export type GetMethods<I extends InterfaceApi> = I extends InterfaceApi<infer M>
  ? M
  : never;

export type GetDBusMethods<
  I extends DBusInterface<InterfaceApi>
> = I extends DBusInterface<infer A> ? GetMethods<A> : never;

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

export type InterfaceApi<
  M extends Methods = {},
  E extends Events = {},
  P extends {} = {}
> = {
  on: <K extends keyof E>(name: K, listener: (value: E[K]) => void) => void;
  off: <K extends keyof E>(name: K, listener: (value: E[K]) => void) => void;
  getProperty: <K extends keyof P>(name: K) => Promise<P[K]>;
} & Promisified<M>;

export type DBusInterface<I extends InterfaceApi> = {
  object: {
    method: Record<keyof GetMethods<I>, unknown>;
  };
  getProperty: <K extends keyof GetProperties<I>>(
    name: K,
    callback: (err: Error, value: GetProperties<I>[K]) => void
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

export type Adapter = InterfaceApi<{
  // StartDiscovery: () => Promise<void>;
  // StopDiscovery: () => Promise<void>;
  StartDiscovery: (callback: (err: Error) => void) => void;
  StopDiscovery: (callback: (err: Error) => void) => void;
}>;

type GetInterface = <I extends InterfaceApi>(
  serviceName: string,
  objectPath: string,
  interfaceName: string,
  callback: (err: Error, value: DBusInterface<I>) => void
) => void;

const getInterface: GetInterface = "x" as any;
const adapter: Adapter = "y" as any;
const dBusInterface: DBusInterface<Adapter> = "z" as any;

adapter.StartDiscovery();
adapter.StopDiscovery();

dBusInterface.object.method.StartDiscovery;
dBusInterface.object.method.StopDiscovery;

dBusInterface.StartDiscovery((err) => console.error(err));

import { promisify } from "util";

(async () => {
  function getMethods<I extends InterfaceApi<any, any, any>>(
    iface: DBusInterface<I>
  ): Promisified<GetMethods<I>> {
    type M = GetDBusMethods<DBusInterface<I>>;
    const getMethod = (n: keyof M) => promisify(iface[n].bind(iface));
    const methodNames = Object.keys(iface.object.method) as (keyof M)[];
    const entries = methodNames.map((n) => [n, getMethod(n)]);
    return Object.fromEntries(entries);
  }

  type AdapterDBusInterface = DBusInterface<Adapter>;
  type AdapterDBusInterfaceMethods = GetDBusMethods<DBusInterface<Adapter>>;

  const iface: AdapterDBusInterface = "x" as any;

  const getMethod = (n: keyof AdapterDBusInterfaceMethods) =>
    promisify(iface[n].bind(iface));

  // dBusInterface
  // DBusInterface
  const methods = getMethods(dBusInterface);
})();

import { promisify } from "util";
import DBus from "dbus";
import type { DBusInterface } from "dbus";
import type { BluezInterfaces } from "dbus";
// import type { ServiceName } from "dbus";
// import type { InterfaceMethod } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

/* export type DBusApi = {
  StartDiscovery: () => Promise<void>;
  StopDiscovery: () => Promise<void>;
  on: <K extends never>(
    name: K,
    listener: (value: DBus.Adapter1Events[K]) => void
  ) => void;
  off: <K extends never>(
    name: K,
    listener: (value: DBus.Adapter1Events[K]) => void
  ) => void;
  getProperty: <K extends never>(
    arg1: K
  ) => Promise<DBus.Adapter1Properties[K]>;
}; */

export type OmitDefaults<T> = Omit<T, "on" | "off" | "getProperty" | "object">;

export type ExtractMethods<T> = {
  [K in keyof T]: Extract<T[K], CallableFunction>;
};

type Methods<I> = ExtractMethods<OmitDefaults<I>>;
type Reducer<I> = (acc: Methods<I>, n: keyof Methods<I>) => Methods<I>;

export default class SystemBus {
  static async getInterface(
    service: "org.bluez",
    path: string,
    name: keyof BluezInterfaces
  ) {
    const iface = await getInterface(service, path, name);
    const on = iface.on.bind(iface);
    const off = iface.off.bind(iface);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = SystemBus.getMethods(iface);
    return { on, off, getProperty, ...methods };
  }

  private static getMethods<
    I extends DBusInterface<BluezInterfaces[keyof BluezInterfaces]>
  >(iface: I) {
    const methods = SystemBus.extractMethods(iface);
    const getMethod = (m: keyof Methods<I>) => promisify(iface[m].bind(m));
    const reducer: Reducer<I> = (acc, n) => ({ ...acc, [n]: getMethod(n) });
    const methodNames = Object.keys(methods) as (keyof Methods<I>)[];
    return methodNames.reduce(reducer, {} as Promisified<Methods<I>>);
  }

  private static extractMethods<
    I extends DBusInterface<BluezInterfaces[keyof BluezInterfaces]>
  >(iface: I): Methods<I> {}
}

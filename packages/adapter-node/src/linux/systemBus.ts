import { promisify } from "util";
import DBus from "dbus";
import type { DBusInterface, Methods, Events } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export type InterfaceApi<P, M extends Methods, E extends Events> = {
  on: EventHandler<E>;
  off: EventHandler<E>;
  getProperty: <K extends keyof P>(name: K) => Promise<P[K]>;
} & Promisified<M>;

export default class SystemBus {
  static async getInterface<P, M extends Methods, E extends Events>(
    service: string,
    path: string,
    name: string
  ): Promise<InterfaceApi<P, M, E>> {
    const iface = await getInterface<P, M, E>(service, path, name);
    const on = iface.on.bind(iface);
    const off = iface.off.bind(iface);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = SystemBus.getMethods(iface);
    return { on, off, getProperty, ...methods };
  }

  private static getMethods<P, M extends Methods, E extends Events>(
    iface: DBusInterface<P, M, E>
  ): Promisified<M> {
    const getMethod = (n: keyof M) => promisify(iface[n].bind(iface));
    const methodNames = Object.keys(iface.object.method) as (keyof M)[];
    const entries = methodNames.map((n) => [n, getMethod(n)]);
    return Object.fromEntries(entries);
  }
}

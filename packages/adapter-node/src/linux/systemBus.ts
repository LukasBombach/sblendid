import { promisify } from "util";
import DBus from "dbus";
import type { DBusInterface, Methods } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export type InterfaceApi<P, M extends Methods, E> = {
  on: Listener<E>;
  off: Listener<E>;
  getProperty: <K extends keyof P>(name: K) => Promise<P[K]>;
} & Promisified<M>;

export default class SystemBus {
  static async getInterface<P, M extends Methods, E>(
    service: string,
    path: string,
    name: string
  ): Promise<InterfaceApi<P, M, E>> {
    const iface = await getInterface<P, M, E>(service, path, name);
    const on: Listener<E> = (event, listener) => iface.on(event, listener);
    const off: Listener<E> = (event, listener) => iface.off(event, listener);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = SystemBus.getMethods(iface);
    return { on, off, getProperty, ...methods };
  }

  private static getMethods<P, M extends Methods, E>(
    iface: DBusInterface<P, M, E>
  ): Promisified<M> {
    const getMethod = (n: keyof M) => promisify(iface[n].bind(iface));
    const methodNames = Object.keys(iface.object.method) as (keyof M)[];
    const entries = methodNames.map((n) => [n, getMethod(n)]);
    return Object.fromEntries(entries);
  }
}

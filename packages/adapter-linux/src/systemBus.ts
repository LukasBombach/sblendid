import { promisify } from "util";
import DBus from "dbus";
import type { DBusInterface } from "dbus";
import type { InterfaceApi, GetMethods, GetDBusMethods } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  static async getInterface<I>(
    service: string,
    path: string,
    name: string
  ): Promise<I> {
    const iface = await getInterface<I>(service, path, name);
    const on = iface.on.bind(iface);
    const off = iface.off.bind(iface);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = SystemBus.getMethods(iface);
    const api = { on, off, getProperty, ...methods };
    return api;
  }

  private static getMethods<I>(
    iface: DBusInterface<I>
  ): Promisified<GetMethods<I>> {
    type M = GetDBusMethods<DBusInterface<I>>;
    const getMethod = (n: keyof M) => promisify(iface[n].bind(iface));
    const methodNames = Object.keys(iface.object.method) as (keyof M)[];
    const entries = methodNames.map((n) => [n, getMethod(n)]);
    return Object.fromEntries(entries);
  }
}

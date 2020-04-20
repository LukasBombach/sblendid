import { promisify } from "util";
import DBus from "dbus";
import type { InterfaceName } from "dbus";
import type { DBusInterfaces } from "dbus";
import type { ServiceName } from "dbus";
import type { InterfaceMethod } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  static async getInterface(
    service: "org.bluez",
    path: string,
    name: "org.bluez.Adapter1"
  ) {
    const iface = await getInterface(service, path, name);
    const on = iface.on.bind(iface);
    const off = iface.off.bind(iface);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = SystemBus.getMethods(iface);
    const api = { on, off, getProperty, ...methods };
    return api;
  }

  private static getMethods<K extends keyof DBusInterfaces[ServiceName]>(
    iface: DBusInterfaces[ServiceName]["org.bluez.Adapter1"]
  ) {
    type Method = keyof InterfaceMethod<"org.bluez.Adapter1">;
    const getMethod = (m: Method) => promisify(iface[m].bind(m));
    const methodNames = Object.keys(iface.object.method) as Method[];
    const entries = methodNames.map((n) => [n, getMethod(n)]);
    return Object.fromEntries(entries);
  }
}

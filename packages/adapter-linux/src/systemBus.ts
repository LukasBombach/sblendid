import { promisify } from "util";
import DBus from "dbus";
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
    return { on, off, getProperty, ...methods };
  }

  private static getMethods(
    iface: DBusInterfaces[ServiceName]["org.bluez.Adapter1"]
  ) {
    type Methods = Promisified<InterfaceMethod<"org.bluez.Adapter1">>;
    type MethodName = keyof InterfaceMethod<"org.bluez.Adapter1">;
    type Reducer = (acc: Methods, n: MethodName) => Methods;
    const getMethod = (m: MethodName) => promisify(iface[m].bind(m));
    const recuceMethods: Reducer = (acc, n) => ({ ...acc, [n]: getMethod(n) });
    const methodNames = Object.keys(iface.object.method) as MethodName[];
    return methodNames.reduce(recuceMethods, {} as Methods);
  }
}

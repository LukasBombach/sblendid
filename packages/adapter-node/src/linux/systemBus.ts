import { promisify } from "util";
import DBus from "dbus";
import { mapValues } from "lodash";
import type { DBusInterface } from "dbus";
import type { Props, Methods, Events, EventMethod } from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  public async getInterface<
    P extends Props = {},
    M extends Methods = {},
    E extends Events = {}
  >(service: string, path: string, name: string) {
    const iface = await getInterface<P, M, E>(service, path, name);
    const on: EventMethod<E> = (event, listener) => iface.on(event, listener);
    const off: EventMethod<E> = (event, listener) => iface.off(event, listener);
    const getProperty = promisify(iface.getProperty.bind(iface));
    const methods = this.getMethods(iface);
    return { on, off, getProperty, ...methods };
  }

  // todo unlawful any
  // todo unlawful typecast as M
  private getMethods<P extends Props, M extends Methods, E extends Events>(
    iface: DBusInterface<P, M, E>
  ): M {
    return mapValues(iface.object.method, (n) =>
      promisify(iface[n as any].bind(iface))
    ) as M;
  }
}

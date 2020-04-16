import { promisify } from "util";
import DBus from "dbus";
import type { DBusInterface } from "../../types/dbus";
import type { DBusApi } from "../../types/dbus";
import type { Methods } from "../../types/dbus";
import type { EventsApi } from "../../types/dbus";
import type { EventMethod } from "../../types/dbus";
import type { PropertiesApi } from "../../types/dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  public async getInterface<I extends DBusInterface>(
    service: string,
    path: string,
    name: string
  ): Promise<DBusApi<I>> {
    const iface = await getInterface(service, path, name);
    const methods = this.getMethods(iface);
    const eventApi = this.getEventApi(iface);
    const propertyApi = this.getPropertyApi(iface);
    return { ...methods, ...eventApi, ...propertyApi } as DBusApi<I>; // todo typecast
  }

  private getMethods<I extends DBusInterface>(
    iface: DBus.DBusInterface
  ): Methods<I> {
    type MM = (entry: [string, any]) => [string, () => any];
    const mapMethod: MM = ([name]) => [name, this.getMethod(iface, name)];
    const entries = Object.entries(iface.object.method).map(mapMethod);
    return Object.fromEntries(entries);
  }

  private getMethod<I extends DBusInterface, N extends keyof Methods<I>>(
    iface: I,
    name: N
  ): Methods<I>[N] {
    return promisify(iface[name].bind(iface));
  }

  private getEventApi<I extends DBusInterface>(
    iface: DBus.DBusInterface
  ): EventsApi<I> {
    const on: EventMethod<I> = (event, listener) => iface.on(event, listener);
    const off: EventMethod<I> = (event, listener) => iface.off(event, listener);
    return { on, off };
  }

  private getPropertyApi<I extends DBusInterface>(
    iface: DBus.DBusInterface
  ): PropertiesApi<I> {
    const getProperty = promisify(iface.getProperty.bind(iface));
    const getProperties = promisify(iface.getProperties.bind(iface));
    return { getProperty, getProperties } as any; // todo unlawful any
  }

  // todo unlawful any
  private asPromised(iface: any, method: any) {
    return { [method]: promisify(iface[method].bind(iface)) };
  }
}

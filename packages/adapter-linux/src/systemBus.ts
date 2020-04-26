import { promisify } from "util";
import DBus from "dbus";

import type { DBusBluezInterfaces, Methods } from "dbus";
import type { Promisify, PromisifyAll } from "./types/promisify";

type GetProperty<K extends keyof DBusBluezInterfaces> = Promisify<
  DBusBluezInterfaces[K]["getProperty"]
>;

export type SystemBusApi<K extends keyof DBusBluezInterfaces> = {
  on: DBusBluezInterfaces[K]["on"];
  off: DBusBluezInterfaces[K]["off"];
  getProperty: GetProperty<K>;
} & PromisifyAll<Methods<K>>;

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class SystemBus {
  static async getInterface<K extends keyof DBusBluezInterfaces>(
    service: "org.bluez",
    path: string,
    name: K
  ): Promise<SystemBusApi<K>> {
    const iface = await getInterface(service, path, name);
    const on = iface.on.bind(iface);
    const off = iface.off.bind(iface);
    const getProperty = SystemBus.getGetProperty(iface);
    const methods = SystemBus.getMethods(iface);
    const api = { on, off, getProperty, ...methods };
    return api;
  }

  private static getGetProperty<K extends keyof DBusBluezInterfaces>(
    iface: DBusBluezInterfaces[K]
  ): GetProperty<K> {
    return promisify(iface.getProperty.bind(iface)) as GetProperty<K>;
  }

  private static getMethods<K extends keyof DBusBluezInterfaces>(
    iface: DBusBluezInterfaces[K]
  ): PromisifyAll<Methods<K>> {
    const names = Object.keys(iface.object.method) as (keyof Methods<K>)[];
    const promisedMethods = {} as PromisifyAll<Methods<K>>;
    for (const name of names) {
      const method = iface[name] as any; // todo unlawful any
      promisedMethods[name] = promisify(method.bind(iface)) as any; // todo unlawful any
    }
    return promisedMethods;
  }
}

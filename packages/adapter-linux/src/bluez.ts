import SystemBus from "./systemBus";
import type { SystemBusApi } from "./systemBus";

import type { DBusBluezInterfaces } from "dbus";

export type Adapter = SystemBusApi<"org.bluez.Adapter1">;
export type ObjectManager = SystemBusApi<"org.freedesktop.DBus.ObjectManager">;

export default class Bluez {
  private static readonly service = "org.bluez";

  static async getAdapter(): Promise<Adapter> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface(path, name);
  }

  static async getObjectManager(): Promise<ObjectManager> {
    const path = "/";
    const name = "org.freedesktop.DBus.ObjectManager";
    return await Bluez.getInterface(path, name);
  }

  static async getInterface<K extends keyof DBusBluezInterfaces>(
    path: string,
    name: K
  ): Promise<SystemBusApi<K>> {
    return await SystemBus.getInterface(Bluez.service, path, name);
  }
}

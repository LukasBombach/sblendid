import SystemBus from "./systemBus";
import type { Methods } from "dbus";
import type { InterfaceApi } from "./systemBus";

type AdapterMethods = {
  StartDiscovery: () => Promise<void>;
  StopDiscovery: () => Promise<void>;
};

export default class Bluez {
  private static readonly service = "org.bluez";

  static async getAdapter(): Promise<InterfaceApi<{}, AdapterMethods, {}>> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface<{}, AdapterMethods, {}>(path, name);
  }

  /* static async getObjectManager(): Promise<
    InterfaceApi<ObjectManagerApi>
  > {
    const path = "/";
    const name = "org.freedesktop.DBus.ObjectManager";
    return await Bluez.getInterface<ObjectManagerApi>(path, name);
  }

   static async getDevice(
    path: string
  ): Promise<InterfaceApi<Device1Api>> {
    const name = "org.bluez.Device1";
    return await Bluez.getInterface<Device1Api>(path, name);
  }

   static async getCharacteristic(
    path: string
  ): Promise<InterfaceApi<GattCharacteristic1Api>> {
    const name = "org.bluez.GattCharacteristic1";
    return await Bluez.getInterface<GattCharacteristic1Api>(path, name);
  } */

  static async getInterface<P, M extends Methods, E>(
    path: string,
    name: string
  ) {
    return await SystemBus.getInterface<P, M, E>(Bluez.service, path, name);
  }
}

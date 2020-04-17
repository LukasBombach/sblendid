import SystemBus from "./systemBus";
import type { DBusInterface, Methods } from "dbus";
import type { DBusInterfaceApi } from "./systemBus";

type Adapter = DBusInterface<
  {},
  {
    StartDiscovery: () => Promise<void>;
    StopDiscovery: () => Promise<void>;
  }
>;

export default class Bluez {
  private static readonly service = "org.bluez";

  public static async getAdapter(): Promise<Adapter> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface<AdapterApi>(path, name);
  }

  public static async getObjectManager(): Promise<
    InterfaceApi<ObjectManagerApi>
  > {
    const path = "/";
    const name = "org.freedesktop.DBus.ObjectManager";
    return await Bluez.getInterface<ObjectManagerApi>(path, name);
  }

  public static async getDevice(
    path: string
  ): Promise<InterfaceApi<Device1Api>> {
    const name = "org.bluez.Device1";
    return await Bluez.getInterface<Device1Api>(path, name);
  }

  public static async getCharacteristic(
    path: string
  ): Promise<InterfaceApi<GattCharacteristic1Api>> {
    const name = "org.bluez.GattCharacteristic1";
    return await Bluez.getInterface<GattCharacteristic1Api>(path, name);
  }

  public static async getInterface<A>(
    path: string,
    name: string
  ): Promise<InterfaceApi<A>> {
    return await SystemBus.getInterface<A>(Bluez.service, path, name);
  }
}

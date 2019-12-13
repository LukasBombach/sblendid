import SystemBus from "./systemBus";
import { InterfaceApi } from "../../types/dbus";
import { AdapterApi, ObjectManagerApi, Device1Api } from "../../types/bluez";

export default class Bluez {
  private static readonly service = "org.bluez";
  private static readonly systemBus = new SystemBus();

  public static async getAdapter(): Promise<InterfaceApi<AdapterApi>> {
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

  public static async getInterface<A>(
    path: string,
    name: string
  ): Promise<InterfaceApi<A>> {
    return await Bluez.systemBus.getInterface<A>(Bluez.service, path, name);
  }
}

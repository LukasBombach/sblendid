import SystemBus from "./systemBus";
import type { InterfaceApi } from "dbus";

export type Adapter = InterfaceApi<{
  StartDiscovery: () => Promise<void>;
  StopDiscovery: () => Promise<void>;
}>;

export default class Bluez {
  private static readonly service = "org.bluez";

  static async getAdapter(): Promise<Adapter> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface<Adapter>(path, name);
  }

  static async getInterface<I extends InterfaceApi>(
    path: string,
    name: string
  ) {
    return await SystemBus.getInterface<I>(Bluez.service, path, name);
  }
}

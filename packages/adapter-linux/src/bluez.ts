import SystemBus from "./systemBus";
import type { DBusApi } from "./systemBus";

export type AdapterApi = DBusApi;

export default class Bluez {
  private static readonly service = "org.bluez";

  static async getAdapter(): Promise<AdapterApi> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface(path, name);
  }

  static async getInterface(
    path: string,
    name: "org.bluez.Adapter1"
  ): Promise<DBusApi> {
    return await SystemBus.getInterface(Bluez.service, path, name);
  }
}

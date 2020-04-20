import SystemBus from "./systemBus";

export default class Bluez {
  private static readonly service = "org.bluez";

  static async getAdapter(): Promise<Adapter> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface(path, name);
  }

  static async getInterface(path: string, name: string) {
    return await SystemBus.getInterface(Bluez.service, path, name);
  }
}

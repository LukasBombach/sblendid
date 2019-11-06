import SystemBus from "./systemBus";
import { OutputApi } from "../../types/dbus";
import { AdapterApi, ObjectManagerApi } from "../../types/bluez";

export default class Bluez {
  private readonly service = "org.bluez";
  private readonly systemBus = new SystemBus();

  public async getAdapter(): Promise<OutputApi<AdapterApi>> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await this.getInterface<AdapterApi>(path, name);
  }

  public async getObjectManager(): Promise<OutputApi<ObjectManagerApi>> {
    const path = "/";
    const name = "org.freedesktop.DBus.ObjectManager";
    return await this.getInterface<ObjectManagerApi>(path, name);
  }

  public async getInterface<A>(path: string, name: string) {
    return await this.systemBus.getInterface<A>(this.service, path, name);
  }
}

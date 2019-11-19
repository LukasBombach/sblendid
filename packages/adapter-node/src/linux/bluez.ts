import SystemBus from "./systemBus";
import { InterfaceApi } from "../../types/dbus";
import { AdapterApi, ObjectManagerApi } from "../../types/bluez";

export default class Bluez {
  private readonly service = "org.bluez";
  private readonly systemBus = new SystemBus();

  public async getAdapter(): Promise<InterfaceApi<AdapterApi>> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await this.getInterface<AdapterApi>(path, name);
  }

  public async getObjectManager(): Promise<InterfaceApi<ObjectManagerApi>> {
    const path = "/";
    const name = "org.freedesktop.DBus.ObjectManager";
    return await this.getInterface<ObjectManagerApi>(path, name);
  }

  public async getInterface<A>(
    path: string,
    name: string
  ): Promise<InterfaceApi<A>> {
    return await this.systemBus.getInterface<A>(this.service, path, name);
  }
}

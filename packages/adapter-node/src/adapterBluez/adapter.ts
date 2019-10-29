import { DBusInterface } from "dbus";
import SystemBus from "./systemBus";
import Bluez from "../../new-src/bluez";

interface Adapter1 extends DBusInterface {
  StartDiscovery: () => Promise<void>;
  StopDiscovery: () => Promise<void>;
}

const adapterParams = {
  service: "org.bluez",
  path: "/org/bluez/hci0",
  name: "org.bluez.Adapter1"
};

export default class BluezAdapter {
  private systemBus = new SystemBus();
  private adapter1?: Adapter1;

  public async startDiscovery(): Promise<void> {
    const adapter1 = await this.getAdapter1();
    console.log("adapter1", adapter1);
    await adapter1.StartDiscovery();
  }

  public async stopDiscovery(): Promise<void> {
    const adapter1 = await this.getAdapter1();
    await adapter1.StopDiscovery();
  }

  private async getAdapter1(): Promise<Adapter1> {
    if (!this.adapter1) this.adapter1 = await this.fetchAdapter1();
    return this.adapter1;
  }

  private async fetchAdapter1(): Promise<Adapter1> {
    return await this.systemBus.getInterface<Adapter1>(adapterParams);
  }
}

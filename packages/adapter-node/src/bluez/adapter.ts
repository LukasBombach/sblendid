import { DBusInterface } from "dbus";
import SystemBus from "./systemBus";

interface Adapter1 extends DBusInterface {
  StartDiscovery: () => Promise<void>;
  StopDiscovery: () => Promise<void>;
}

export default class BluezAdapter {
  private systemBus = new SystemBus();
  private adapter1?: Adapter1;

  public async startDiscovery(): Promise<void> {
    const adapter1 = await this.getAdapter1();
    await adapter1.StartDiscovery();
  }

  public async stopDiscovery(): Promise<void> {
    const adapter1 = await this.getAdapter1();
    await adapter1.StopDiscovery();
  }

  private async getAdapter1(): Promise<Adapter1> {
    if (!this.adapter1) {
      this.adapter1 = await this.systemBus.getInterface<Adapter1>(
        "org.bluez",
        "/org/bluez/hci0",
        "org.bluez.Adapter1"
      );
    }
    return this.adapter1;
  }
}

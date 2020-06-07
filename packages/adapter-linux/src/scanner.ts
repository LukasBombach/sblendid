import BluezInterface from "./bluezInterface";
import type { FindCondition } from "@sblendid/types/adapter";
import type { PeripheralJSON } from "@sblendid/types/adapter";

export default class Scanner {
  private adapter = new BluezInterface("org.bluez.Adapter1", "/org/bluez/hci0");

  async startScanning(): Promise<void> {
    await this.adapter.call("StartDiscovery");
  }

  async stopScanning(): Promise<void> {
    await this.adapter.call("StopDiscovery");
  }

  async find(findCondition: FindCondition): Promise<PeripheralJSON> {}
}

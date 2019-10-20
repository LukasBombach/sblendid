import BluezAdapter from "./adapter";
import ObjectManager from "./objectManager";

export class Bluez {
  private adapter = new BluezAdapter();
  private objectManager = new ObjectManager();

  public async init(): Promise<void> {}

  public async startScanning(): Promise<void> {
    await this.adapter.startDiscovery();
  }

  public async stopScanning(): Promise<void> {
    await this.adapter.stopDiscovery();
  }
}

import Bluez from "./bluez";
import ObjectManager from "./objectManager";
import Watcher from "../watcher";
import type { Api } from "./objectManager";
import type { Adapter } from "../types/bluez";
import type { FindCondition } from "../types/adapter";
import type { PeripheralJSON } from "../types/adapter";

export default class Scanner {
  private adapter?: Adapter;

  async startScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StartDiscovery();
  }

  async stopScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StopDiscovery();
  }

  async find(condition: FindCondition): Promise<PeripheralJSON> {
    const watcher = this.getWatcher(condition);
    await this.startScanning();
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    return peripheral;
  }

  private getWatcher(condition: FindCondition): Watcher<Api, "discover"> {
    const manager = new ObjectManager();
    const discoverCondition = this.getDiscoverCondition(condition);
    return new Watcher(manager, "discover", discoverCondition);
  }

  private getDiscoverCondition(condition: FindCondition) {}

  private async getAdapter(): Promise<Adapter> {
    if (!this.adapter) this.adapter = await Bluez.getAdapter();
    return this.adapter;
  }
}

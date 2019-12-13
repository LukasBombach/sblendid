import { FindCondition } from "../../types/sblendidAdapter";
import { Adapter } from "../../types/bluez";
import Bluez from "./bluez";
import ObjectManager, { Api } from "./objectManager";
import Watcher from "../watcher";
import { Params } from "../../types/noble";

export default class Scanner {
  private adapter?: Adapter;
  private objectManager: ObjectManager = new ObjectManager();

  public async startScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StartDiscovery();
  }

  public async stopScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StopDiscovery();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    const mngr = this.objectManager;
    const watcher = new Watcher<Api, "discover">(mngr, "discover", condition);
    await this.startScanning();
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    return peripheral;
  }

  private async getAdapter(): Promise<Adapter> {
    if (!this.adapter) this.adapter = await Bluez.getAdapter();
    return this.adapter;
  }
}

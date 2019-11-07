import { Params } from "../../types/noble";
import SblendidAdapter from "../../types/sblendidAdapter";
import { FindCondition, Characteristic } from "../../types/sblendidAdapter";
import { Adapter, ObjectManager } from "../../types/bluez";
import Watcher from "../watcher";
import Bluez from "./bluez";

export default class BluezAdapter implements SblendidAdapter {
  private bluez = new Bluez();
  private adapter?: Adapter;
  private objectManager?: ObjectManager;

  public async init(): Promise<void> {}

  public async startScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StartDiscovery();
  }

  public async stopScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StopDiscovery();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    const watcher = await this.getWatcher("discover", condition);
    await this.startScanning();
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    return peripheral;
  }

  public async connect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet");
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    throw new Error("Not implemented yet");
  }

  public async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    throw new Error("Not implemented yet");
  }

  public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    throw new Error("Not implemented yet");
  }

  public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    throw new Error("Not implemented yet");
  }

  private async getWatcher(event: string, condition: FindCondition) {
    const objectManager = await this.getObjectManager();
    return new Watcher(objectManager, event, condition);
  }

  private async getAdapter(): Promise<Adapter> {
    if (!this.adapter) this.adapter = await this.bluez.getAdapter();
    return this.adapter;
  }

  private async getObjectManager(): Promise<ObjectManager> {
    if (!this.objectManager)
      this.objectManager = await this.bluez.getObjectManager();
    return this.objectManager;
  }
}

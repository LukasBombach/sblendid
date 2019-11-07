import { PUUID, SUUID, CUUID } from "../../types/ble";
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
    console.log("startScanning");
    const adapter = await this.getAdapter();
    await adapter.StartDiscovery();
  }

  public async stopScanning(): Promise<void> {
    console.log("stopScanning");
    const adapter = await this.getAdapter();
    await adapter.StopDiscovery();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    const watcher = await this.getWatcher<Params<"discover">>( // todo bad explicit type declaration
      "InterfacesAdded", // todo there must be a typeguard here
      condition
    );
    await this.startScanning();
    console.log("Waiting for watcher to be resolved");
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    console.log("returning peripheral", peripheral);
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

  private async getWatcher<P extends any[]>(
    event: string,
    condition: FindCondition
  ) {
    const objectManager = await this.getObjectManager();
    return new Watcher<P>(objectManager, event, condition); // todo bad explicit type declaration
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

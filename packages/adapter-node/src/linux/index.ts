import { Params } from "../../types/noble";
import SblendidAdapter from "../../types/sblendidAdapter";
import { FindCondition, Characteristic } from "../../types/sblendidAdapter";
import { OutputApi } from "../../types/dbus";
import { AdapterApi, ObjectManagerApi } from "../../types/bluez";
import Bluez from "./bluez";
import { NotInitializedError } from "../errors";

export default class BluezAdapter implements SblendidAdapter {
  private bluez = new Bluez();
  private adapter?: OutputApi<AdapterApi>;
  private objectManager?: OutputApi<ObjectManagerApi>;

  public async init(): Promise<void> {
    this.adapter = await this.bluez.getAdapter();
    this.objectManager = await this.bluez.getObjectManager();
  }

  public async startScanning(): Promise<void> {
    if (!this.adapter) throw new NotInitializedError("startScanning");
    await this.adapter.StartDiscovery();
  }

  public async stopScanning(): Promise<void> {
    if (!this.adapter) throw new NotInitializedError("startScanning");
    await this.adapter.StopDiscovery();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    throw new Error("Not implemented yet");
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
}

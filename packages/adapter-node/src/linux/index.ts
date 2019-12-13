import { PUUID, SUUID, CUUID } from "../../types/ble";
import { Params } from "../../types/noble";
import SblendidAdapter, { FindCondition } from "../../types/sblendidAdapter";
import { Characteristic } from "../../types/sblendidAdapter";
import { Adapter } from "../../types/bluez";
import Watcher from "../watcher";
import ObjectManager, { Api } from "./objectManager";
import Scanner from "./scanner";
import { Emitter } from "../../types/watcher";
import Device from "./device";

export default class LinuxAdapter implements SblendidAdapter {
  private objectManager = new ObjectManager();
  private scanner = new Scanner();

  public async init(): Promise<void> {}

  public async startScanning(): Promise<void> {
    await this.scanner.startScanning();
  }

  public async stopScanning(): Promise<void> {
    await this.scanner.stopScanning();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    return await this.scanner.find(condition);
  }

  public async connect(pUUID: PUUID): Promise<void> {
    const device = this.getDevice(pUUID);
    await device.connect();
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    const device = this.getDevice(pUUID);
    await device.disconnect();
  }

  public async getRssi(pUUID: PUUID): Promise<number> {
    const device = this.getDevice(pUUID);
    return await device.getRssi();
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    const device = this.getDevice(pUUID);
    const condition = async () => {
      await new Promise(res => setTimeout(res, 50)); // todo no, just no.
      const resolved = await device.servicesResolved();
      return resolved;
    };
    if (!(await condition())) {
      await Watcher.resolved(
        this.objectManager as Emitter<Api>, // todo bad typecast
        "service",
        condition
      );
    }
    return await device.getServiceUUIDs();
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

  private getDevice(pUUID: PUUID): Device {
    const device = Device.find(pUUID);
    const msg = `Could not find the device with the uuid "${pUUID}"`;
    if (!device) throw new Error(msg);
    return device;
  }
}

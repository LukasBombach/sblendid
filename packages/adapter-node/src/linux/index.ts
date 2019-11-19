import { PUUID, SUUID, CUUID } from "../../types/ble";
import { Params } from "../../types/noble";
import SblendidAdapter, { FindCondition } from "../../types/sblendidAdapter";
import { Characteristic } from "../../types/sblendidAdapter";
import { Adapter } from "../../types/bluez";
import Watcher from "../watcher";
import Bluez from "./bluez";
import ObjectManager from "./objectManager";
import Device from "./device";
import SystemBus from "./systemBus";

export default class BluezAdapter implements SblendidAdapter {
  private bluez = new Bluez();
  private adapter?: Adapter;
  private objectManager: ObjectManager = new ObjectManager();

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
    const watcher = new Watcher(this.objectManager, "discover", condition);
    await this.startScanning();
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    return peripheral;
  }

  public async connect(pUUID: PUUID): Promise<void> {
    const device = this.getDevice(pUUID);
    await device.connect();
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    const device = this.getDevice(pUUID);
    await device.disconnect();
  }

  public getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet");
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    const device = this.getDevice(pUUID);
    const iface = await SystemBus.fetchInterface(
      "org.bluez",
      device.path,
      "org.bluez.Device1"
    );
    return iface as any;
    // const device = this.getDevice(pUUID);
    // const condition = async () => await device.getProperty("ServicesResolveds");
    // await Watcher.resolved(this.objectManager, "service", condition);
    // return device.getServiceUUIDs();
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

  private async getAdapter(): Promise<Adapter> {
    if (!this.adapter) this.adapter = await this.bluez.getAdapter();
    return this.adapter;
  }
}

import { PUUID, SUUID, CUUID } from "../../types/ble";
import { Params } from "../../types/noble";
import SblendidAdapter, { FindCondition } from "../../types/sblendidAdapter";
import { Characteristic } from "../../types/sblendidAdapter";
import { Adapter } from "../../types/bluez";
import Watcher from "../watcher";
import Bluez from "./bluez";
import ObjectManager, { Api } from "./objectManager";
import { Emitter } from "../../types/watcher";
import Device from "./device";

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
    const watcher = new Watcher(
      this.objectManager as Emitter<Api>, // todo bad typecast
      "discover",
      condition
    );
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
    const condition = async () => {
      console.log("init check, waiting 1000ms");
      await new Promise(res => setTimeout(res, 1000));
      const resolved = await device.servicesResolved();
      console.log("resolved?", resolved);
      return resolved;
    };
    console.log("Setting up interval");
    setInterval(async () => {
      const resolved = await device.servicesResolved();
      console.log("#interval resolved?", resolved);
    }, 1000);
    console.log("Performing first check");
    if (!(await condition())) {
      console.log("First check false, starting watcher");
      await Watcher.resolved(
        this.objectManager as Emitter<Api>, // todo bad typecast
        "service",
        condition
      );
    } else {
      console.log("Fist check true");
    }
    console.log("resolved, loading uuids");
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

  private async getAdapter(): Promise<Adapter> {
    if (!this.adapter) this.adapter = await this.bluez.getAdapter();
    return this.adapter;
  }
}

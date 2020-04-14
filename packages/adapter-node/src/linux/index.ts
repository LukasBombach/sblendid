import Scanner from "./scanner";
import Device from "./device";
import Service from "./service";
import Characteristic from "./characteristic";
import type { Adapter } from "../types/adapter";
import type { FindCondition } from "../types/adapter";
import type { PeripheralJSON } from "../types/adapter";
import type { CharacteristicJSON } from "../types/adapter";

export default class LinuxAdapter implements Adapter {
  private scanner = new Scanner();

  async init(): Promise<void> {}

  async startScanning(): Promise<void> {
    await this.scanner.startScanning();
  }

  async stopScanning(): Promise<void> {
    await this.scanner.stopScanning();
  }

  async find(condition: FindCondition): Promise<PeripheralJSON> {
    return await this.scanner.find(condition);
  }

  async connect(pUUID: PUUID): Promise<void> {
    const device = this.getDevice(pUUID);
    await device.connect();
  }

  async disconnect(pUUID: PUUID): Promise<void> {
    const device = this.getDevice(pUUID);
    await device.disconnect();
  }

  async getRssi(pUUID: PUUID): Promise<number> {
    const device = this.getDevice(pUUID);
    return await device.getRssi();
  }

  async getServices(pUUID: PUUID): Promise<SUUID[]> {
    const device = this.getDevice(pUUID);
    return await device.getServiceUUIDs();
  }

  async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<CharacteristicJSON[]> {
    const characteristics = Characteristic.findByService(sUUID);
    return characteristics.map((c) => c.serialize());
  }

  async read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    const characteristic = this.getCharacteristic(cUUID);
    return await characteristic.read();
  }

  async write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    const characteristic = this.getCharacteristic(cUUID);
    return await characteristic.write(value, withoutResponse);
  }

  async notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    const characteristic = this.getCharacteristic(cUUID);
    return await characteristic.notify(notify);
  }

  private getDevice(pUUID: PUUID): Device {
    const device = Device.find(pUUID);
    if (!device) throw this.notFoundError("device", pUUID);
    return device;
  }

  private getService(sUUID: SUUID): Service {
    const service = Service.find(sUUID);
    if (!service) throw this.notFoundError("service", sUUID);
    return service;
  }

  private getCharacteristic(cUUID: CUUID): Characteristic {
    const characteristic = Characteristic.find(cUUID);
    if (!characteristic) throw this.notFoundError("characteristic", cUUID);
    return characteristic;
  }

  private notFoundError(iface: string, uuid: PUUID | SUUID | CUUID): Error {
    const msg = `Could not find the ${iface} with the uuid "${uuid}"`;
    return new Error(msg);
  }
}
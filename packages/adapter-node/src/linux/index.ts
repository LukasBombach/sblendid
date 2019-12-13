import { PUUID, SUUID, CUUID } from "../../types/ble";
import { Params } from "../../types/noble";
import SblendidAdapter, { FindCondition } from "../../types/sblendidAdapter";
import Characteristic from "./characteristic";
import Scanner from "./scanner";
import Device from "./device";
import Service from "./service";

export default class LinuxAdapter implements SblendidAdapter {
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
    return await device.getServiceUUIDs();
  }

  public async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    const service = this.getService(pUUID, sUUID);
    return await service.getCharacteristics();
  }

  public async read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    const characteristic = this.getCharacteristic(cUUID);
    return await characteristic.read();
  }

  public async write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    const characteristic = this.getCharacteristic(cUUID);
    return await characteristic.write(value, withoutResponse);
  }

  public async notify(
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

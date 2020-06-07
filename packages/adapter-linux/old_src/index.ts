import Scanner from "./scanner";
import type { Adapter } from "@sblendid/types/adapter";
import type { FindCondition } from "@sblendid/types/adapter";
import type { PeripheralJSON } from "@sblendid/types/adapter";

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

  private getDevice(pUUID: PUUID): Device {
    const device = Device.find(pUUID);
    if (!device) throw this.notFoundError("device", pUUID);
    return device;
  }

  private notFoundError(iface: string, uuid: PUUID | SUUID | CUUID): Error {
    const msg = `Could not find the ${iface} with the uuid "${uuid}"`;
    return new Error(msg);
  }
}

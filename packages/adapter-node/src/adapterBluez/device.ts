import md5 from "md5";
import { Params, Advertisement, ServiceData } from "../types/noble";
import SystemBus from "./systemBus";
import { Device1 } from "./objectManager";
import List from "./list";

interface Device1Interface {
  Connect: (callback: (error?: Error) => void) => void;
  Disconnect: (callback: (error?: Error) => void) => void;
}

export default class Device {
  private static devices = new List<Device>();
  public readonly uuid: PUUID;
  public readonly path: string;
  public readonly device1: Device1;
  private systemBus = new SystemBus();
  private device1Interface?: Device1Interface;

  static add(device: Device): void {
    Device.devices.add(device);
  }

  static find(pUUID: PUUID): Device | undefined {
    return Device.devices.find(d => d.uuid === pUUID);
  }

  constructor(path: string, device1: Device1) {
    this.uuid = this.getPUUID(device1.Address);
    this.path = path;
    this.device1 = device1;
  }

  public async connect(): Promise<void> {
    return new Promise(async (res, rej) => {
      const device1Interface = await this.getDevice1Interface();
      device1Interface.Connect(err => (err ? rej(err) : res()));
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise(async (res, rej) => {
      const device1Interface = await this.getDevice1Interface();
      device1Interface.Disconnect(err => (err ? rej(err) : res()));
    });
  }

  public getNobleParams(): Params<"discover"> {
    const { Address, AddressType, Blocked, RSSI } = this.device1;
    const uuid = this.getPUUID(Address);
    const advertisement = this.getAdvertisement();
    return [uuid, Address, AddressType, !Blocked, advertisement, RSSI];
  }

  private async getDevice1Interface(): Promise<Device1Interface> {
    if (!this.device1Interface) {
      this.device1Interface = await this.fetchDevice1Interface();
    }
    return this.device1Interface;
  }

  private fetchDevice1Interface(): Promise<Device1Interface> {
    const service = "org.bluez";
    const path = this.path;
    const name = "org.bluez.Device1";
    return this.systemBus.getInterface({ service, path, name }) as any; // todo unlawful typecast
  }

  private getPUUID(address: string): PUUID {
    const hash = md5(address);
    return [
      hash.substr(0, 8),
      hash.substr(8, 4),
      hash.substr(12, 4),
      hash.substr(16, 4),
      hash.substr(20, 12)
    ].join("-");
  }

  private getAdvertisement(): Advertisement {
    const { Alias, Address, UUIDs, TxPower } = this.device1;
    const localName = Alias === Address.replace(/:/g, "-") ? undefined : Alias;
    const txPowerLevel = TxPower;
    const serviceUuids = UUIDs;
    const manufacturerData = this.getNobleManufacturerData();
    const serviceData = this.getNobleServiceData();
    return {
      localName,
      txPowerLevel,
      serviceUuids,
      manufacturerData,
      serviceData
    };
  }

  private getNobleManufacturerData(): Buffer | undefined {
    const manufacturerData = this.device1.ManufacturerData || {};
    const manufacturerValues = Object.values(manufacturerData);
    if (manufacturerValues.length) return Buffer.from(manufacturerValues[0]);
    return undefined;
  }

  private getNobleServiceData(): ServiceData[] {
    const serviceEntries = Object.entries(this.device1.ServiceData || {});
    return serviceEntries.map(([uuid, bytes]) => ({
      uuid,
      data: Buffer.from(bytes)
    }));
  }
}

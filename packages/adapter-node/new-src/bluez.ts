import { EventEmitter } from "events";
import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";
import md5 from "md5";
import { NotInitializedError } from "./errors";
import { Params, Advertisement, ServiceData } from "./types/nobleAdapter";

interface Device1 {
  Address: string;
  AddressType: "public" | "random";
  Alias: string;
  Blocked: boolean;
  RSSI: number;
  TxPower: number;
  UUIDs: string[];
  ManufacturerData: Record<string, number[]>;
  ServiceData: Record<string, number[]>;
  AdvertisingData: Record<string, number[]>;
}

interface Interfaces {
  "org.bluez.Device1"?: Device1;
}

const bus = DBus.getBus("system");
const getInterface = promisify<string, string, string, DBusInterface>(
  bus.getInterface.bind(bus)
);

export default class Bluez extends EventEmitter {
  public startScanning: () => Promise<void> = this.NiN("startDiscovery");
  public stopScanning: () => Promise<void> = this.NiN("stopDiscovery");

  public async init(): Promise<void> {
    const adapter = await this.getAdapter();
    const objectManager = await this.getObjectManager();
    this.startScanning = promisify(adapter.StartDiscovery.bind(adapter));
    this.stopScanning = promisify(adapter.StopDiscovery.bind(adapter));
    objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  private onInterfacesAdded(path: any, interfaces: Interfaces): void {
    if (!interfaces["org.bluez.Device1"]) return;
    const device = interfaces["org.bluez.Device1"];
    const noblePeripheral = this.getNoblePeripheral(device);
    this.emit("discover", noblePeripheral);
  }

  private getNoblePeripheral(device: Device1): Params<"discover"> {
    const { Address, AddressType, Blocked, RSSI } = device;
    const uuid = this.addressToUuid(Address);
    const advertisement = this.getAdvertisement(device);
    return [uuid, Address, AddressType, !Blocked, advertisement, RSSI];
  }

  private getAdvertisement(device: Device1): Advertisement {
    const { Alias, Address, UUIDs, TxPower } = device;
    const localName = Alias === Address.replace(/:/g, "-") ? undefined : Alias;
    const txPowerLevel = TxPower;
    const serviceUuids = UUIDs;
    const manufacturerData = this.getNobleManufacturerData(device);
    const serviceData = this.getNobleServiceData(device);
    return {
      localName,
      txPowerLevel,
      serviceUuids,
      manufacturerData,
      serviceData
    };
  }

  private getNobleManufacturerData(device: Device1): Buffer | undefined {
    const manufacturerValues = Object.values(device.ManufacturerData || {});
    if (manufacturerValues.length) return Buffer.from(manufacturerValues[0]);
    return undefined;
  }

  private getNobleServiceData(device: Device1): ServiceData[] {
    const serviceEntries = Object.entries(device.ServiceData || {});
    return serviceEntries.map(([uuid, bytes]) => ({
      uuid,
      data: Buffer.from(bytes)
    }));
  }

  private addressToUuid(address: string) {
    const hash = md5(address);
    return [
      hash.substr(0, 8),
      hash.substr(8, 4),
      hash.substr(12, 4),
      hash.substr(16, 4),
      hash.substr(20, 12)
    ].join("-");
  }

  private getAdapter(): Promise<DBusInterface> {
    return getInterface("org.bluez", "/org/bluez/hci0", "org.bluez.Adapter1");
  }

  private getObjectManager(): Promise<DBusInterface> {
    return getInterface("org.bluez", "/", "org.freedesktop.DBus.ObjectManager");
  }

  private NiN(name: string): () => Promise<never> {
    return () => Promise.reject(new NotInitializedError(name));
  }
}

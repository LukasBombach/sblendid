import { EventEmitter } from "events";
import { promisify } from "util";
import DBus, { DBusInterface, DBusError } from "dbus";
import md5 from "md5";
import { NotInitializedError } from "./errors";
import { Params, Advertisement, ServiceData } from "./types/nobleAdapter";

interface Device {
  Address: string;
  AddressType: "public" | "random";
  Alias: string;
  Blocked: boolean;
  RSSI: number;
  TxPower: number;
  UUIDs: string[];
  ServicesResolved: boolean;
  ManufacturerData: Record<string, number[]>;
  ServiceData: Record<string, number[]>;
  AdvertisingData: Record<string, number[]>;
  Connect: (callback: (error?: Error) => void) => void;
  Disconnect: (callback: (error?: Error) => void) => void;
  getProperty(
    name: string,
    callback: (err: DBusError, name: string) => void
  ): void;
}

interface Service {
  UUID: string;
  Device: string;
  Primary: boolean;
  Includes: any[];
}

interface Interfaces {
  "org.bluez.Device1"?: Device;
  "org.bluez.GattService1"?: Service;
}

type DevicePath = string;

const bus = DBus.getBus("system");
const getInterface = promisify<string, string, string, DBusInterface>(
  bus.getInterface.bind(bus)
);

export default class Bluez extends EventEmitter {
  public startScanning: () => Promise<void> = this.NIN("startDiscovery");
  public stopScanning: () => Promise<void> = this.NIN("stopDiscovery");
  private getManagedObjects: () => Promise<any> = this.NIN("getManagedObjects");
  private devices: Record<PUUID, DevicePath> = {};
  private services: Record<DevicePath, Set<SUUID>> = {};

  public async init(): Promise<void> {
    const adapter = await this.getAdapter();
    const objectManager = await this.getObjectManager();
    objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
    this.startScanning = promisify(adapter.StartDiscovery.bind(adapter));
    this.stopScanning = promisify(adapter.StopDiscovery.bind(adapter));
    this.getManagedObjects = promisify(
      objectManager.GetManagedObjects.bind(objectManager)
    );
    const managedObjects = await this.getManagedObjects();
    for (const key in managedObjects)
      this.onInterfacesAdded(key, managedObjects[key]);
  }

  public connect(pUUID: PUUID): Promise<void> {
    return new Promise(async (res, rej) => {
      const device = await this.getDevice(this.devices[pUUID]);
      device.Connect(err => (err ? rej(err) : res()));
    });
  }

  public disconnect(pUUID: PUUID): Promise<void> {
    return new Promise(async (res, rej) => {
      const device = await this.getDevice(this.devices[pUUID]);
      device.Disconnect(err => (err ? rej(err) : res()));
    });
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    const devicePath = this.devices[pUUID];
    const device = await this.getDevice(devicePath);
    const servicesResolved = await promisify(device.getProperty.bind(device))(
      "ServicesResolved"
    );
    console.log("servicesResolved", servicesResolved);
    return Array.from(this.services[devicePath]);
  }

  private onInterfacesAdded(path: string, interfaces: Interfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    if (device) this.handleDevice(device, path);
    if (service) this.handleService(service);
    if (device) {
      console.log("device", device);
    }
    if (service) {
      console.log("service", service);
    }
  }

  private handleDevice(device: Device, path: string): void {
    const noblePeripheral = this.getNoblePeripheral(device);
    const [pUUID] = noblePeripheral;
    this.devices[pUUID] = path;
    this.emit("discover", ...noblePeripheral);
  }

  private handleService(service: Service): void {
    const { UUID, Device } = service;
    this.services[Device] = this.services[Device] || new Set();
    this.services[Device].add(UUID);
  }

  private getNoblePeripheral(device: Device): Params<"discover"> {
    const { Address, AddressType, Blocked, RSSI } = device;
    const uuid = this.addressToUuid(Address);
    const advertisement = this.getAdvertisement(device);
    return [uuid, Address, AddressType, !Blocked, advertisement, RSSI];
  }

  private getAdvertisement(device: Device): Advertisement {
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

  private getNobleManufacturerData(device: Device): Buffer | undefined {
    const manufacturerValues = Object.values(device.ManufacturerData || {});
    if (manufacturerValues.length) return Buffer.from(manufacturerValues[0]);
    return undefined;
  }

  private getNobleServiceData(device: Device): ServiceData[] {
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

  private getDevice(path: string): Promise<Device> {
    return getInterface("org.bluez", path, "org.bluez.Device1") as any; // todo unlawful typecast
  }

  private NIN(name: string): () => Promise<never> {
    return () => Promise.reject(new NotInitializedError(name));
  }
}

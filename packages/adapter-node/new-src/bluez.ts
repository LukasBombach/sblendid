import { EventEmitter } from "events";
import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";
import md5 from "md5";
import { NotInitializedError } from "./errors";
import { Params, Advertisement } from "./types/nobleAdapter";

type GetInterface = (
  serviceName: string,
  objectPath: string,
  interfaceName: string
) => Promise<DBusInterface>;

interface Interfaces {
  "org.bluez.Device1"?: {
    Address: string;
    AddressType: "public" | "random";
    Alias: string;
    Blocked: boolean;
    RSSI: number;
    TxPower: number;
    UUIDs: string[];
    ManufacturerData: {
      [key: string]: number[];
    };
    ServiceData: {
      [key: string]: number[];
    };
    AdvertisingData: {
      [key: string]: number[];
    };
  };
}

const bus = DBus.getBus("system");
const getInterface: GetInterface = promisify(bus.getInterface.bind(bus));

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
    const device = "org.bluez.Device1";
    if (typeof interfaces[device]) {
      const {
        Alias,
        Address,
        AddressType,
        Blocked,
        UUIDs,
        RSSI,
        TxPower,
        ManufacturerData = {},
        ServiceData = {}
      } = interfaces[device]!;
      const nobleManufacturerData = Object.values(ManufacturerData).length
        ? Buffer.from(Object.values(ManufacturerData)[0])
        : undefined;
      const nobleServiceData = Object.entries(ServiceData).map(
        ([uuid, bytes]) => ({ uuid, data: Buffer.from(bytes) })
      );
      const advertisement: Advertisement = {
        localName: Alias,
        txPowerLevel: TxPower,
        serviceUuids: UUIDs,
        manufacturerData: nobleManufacturerData,
        serviceData: nobleServiceData
      };
      const peripheral: Params<"discover"> = [
        this.addressToUuid(Address),
        Address,
        AddressType,
        !Blocked,
        advertisement,
        RSSI
      ];
      this.emit("discover", peripheral);
    }
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

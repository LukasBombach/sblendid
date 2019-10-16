import { EventEmitter } from "events";
import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";
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
  public startScanning: () => Promise<unknown> = this.NiN("startDiscovery");
  public stopScanning: () => Promise<unknown> = this.NiN("stopDiscovery");

  public static async init(): Promise<Bluez> {
    const bluez = new Bluez();
    await bluez.init();
    return bluez;
  }

  public async init(): Promise<void> {
    const adapter = await this.getAdapter();
    this.startScanning = promisify(adapter.StartDiscovery.bind(adapter));
    this.stopScanning = promisify(adapter.StopDiscovery.bind(adapter));
    await this.setupEvents();
  }

  private async setupEvents(): Promise<void> {
    const objectManager = await this.getObjectManager();
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
        Address.replace(/:/g, "-"),
        Address,
        AddressType,
        !Blocked,
        advertisement,
        RSSI
      ];
      this.emit("discover", peripheral);
    }
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

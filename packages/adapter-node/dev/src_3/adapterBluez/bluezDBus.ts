import SystemBus, { InterfaceApi } from "./systemBus";

interface AdapterApi {
  methods: {
    StartDiscovery: () => Promise<void>;
    StopDiscovery: () => Promise<void>;
  };
}

interface ObjectManagerApi {
  events: {
    InterfacesAdded: [string, Interfaces];
  };
}

export interface Device1 {
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
}

export interface GattService1 {
  UUID: SUUID;
  Device: string;
  Primary: boolean;
  Includes: any[];
}

export interface GattCharacteristic1 {}

export interface Interfaces {
  "org.bluez.Device1"?: Device1;
  "org.bluez.GattService1"?: GattService1;
  "org.bluez.GattCharacteristic1"?: GattCharacteristic1;
}

export default class BluezDBus {
  private readonly service = "org.bluez";
  private readonly systemBus = new SystemBus();

  public async getAdapter(): Promise<InterfaceApi<AdapterApi>> {
    return await this.getInterface<AdapterApi>(
      "/org/bluez/hci0",
      "org.bluez.Adapter1"
    );
  }

  public async getObjectManager(): Promise<InterfaceApi<ObjectManagerApi>> {
    return await this.getInterface<ObjectManagerApi>(
      "/",
      "org.freedesktop.DBus.ObjectManager"
    );
  }

  public async getInterface<A>(path: string, name: string) {
    return await this.systemBus.getInterface<A>(this.service, path, name);
  }
}

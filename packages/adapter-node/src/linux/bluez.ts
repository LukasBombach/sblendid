import SystemBus from "./systemBus";
import type { Methods } from "dbus";
import type { InterfaceApi } from "./systemBus";

type AdapterMethods = {
  StartDiscovery: () => Promise<void>;
  StopDiscovery: () => Promise<void>;
};

export type Adapter = InterfaceApi<{}, AdapterMethods, {}>;

type ManagedObjects = Record<string, Record<string, Interfaces>>;

export interface Device1 {
  Adapter: string;
  Address: string;
  AddressType: "public" | "random";
  Alias: string;
  Blocked: boolean;
  Connected: boolean;
  LegacyPairing: boolean;
  ManufacturerData: Record<string, number[]>;
  Name: string;
  Paired: boolean;
  RSSI: number;
  ServiceData: Record<string, number[]>;
  ServicesResolved: boolean;
  Trusted: boolean;
  TxPower: number;
  UUIDs: string[];
}

export interface GattService1 {
  Device: string;
  Primary: boolean;
  UUID: SUUID;
}

export interface GattCharacteristic1 {
  UUID: CUUID;
  Service: GattService1;
  Flags: ("read" | "write" | "notify")[];
}

export interface Interfaces {
  "org.bluez.Device1"?: Device1;
  "org.bluez.GattService1"?: GattService1;
  "org.bluez.GattCharacteristic1"?: GattCharacteristic1;
}

export type ObjectManagerMethods = {
  GetManagedObjects: () => Promise<ManagedObjects>;
};

export type ObjectManagerEvents = {
  InterfacesAdded: [string, Interfaces];
};

export type ObjectManager = InterfaceApi<
  {},
  ObjectManagerMethods,
  ObjectManagerEvents
>;

export default class Bluez {
  private static readonly service = "org.bluez";

  static async getAdapter(): Promise<Adapter> {
    const path = "/org/bluez/hci0";
    const name = "org.bluez.Adapter1";
    return await Bluez.getInterface<{}, AdapterMethods, {}>(path, name);
  }

  static async getObjectManager(): Promise<ObjectManager> {
    const path = "/";
    const name = "org.freedesktop.DBus.ObjectManager";
    return await Bluez.getInterface<
      {},
      ObjectManagerMethods,
      ObjectManagerEvents
    >(path, name);
  }

  /*  static async getDevice(
    path: string
  ): Promise<InterfaceApi<Device1Api>> {
    const name = "org.bluez.Device1";
    return await Bluez.getInterface<Device1Api>(path, name);
  }

   static async getCharacteristic(
    path: string
  ): Promise<InterfaceApi<GattCharacteristic1Api>> {
    const name = "org.bluez.GattCharacteristic1";
    return await Bluez.getInterface<GattCharacteristic1Api>(path, name);
  } */

  static async getInterface<P, M extends Methods, E>(
    path: string,
    name: string
  ) {
    return await SystemBus.getInterface<P, M, E>(Bluez.service, path, name);
  }
}

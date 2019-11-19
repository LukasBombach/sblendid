import { InterfaceApi } from "./dbus";

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

export interface GattCharacteristic1 {}

export interface Interfaces {
  "org.bluez.Device1"?: Device1;
  "org.bluez.GattService1"?: GattService1;
  "org.bluez.GattCharacteristic1"?: GattCharacteristic1;
}

export interface AdapterApi {
  methods: {
    StartDiscovery: () => Promise<void>;
    StopDiscovery: () => Promise<void>;
  };
}

export interface ObjectManagerApi {
  methods: {
    GetManagedObjects: () => Promise<ManagedObjects>;
  };
  events: {
    InterfacesAdded: (path: string, interfaces: Interfaces) => void;
  };
}

export type Adapter = InterfaceApi<AdapterApi>;
export type ObjectManager = InterfaceApi<ObjectManagerApi>;
export type ManagedObjects = Record<string, Record<string, Interfaces>>;

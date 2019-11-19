import { OutputApi } from "./dbus";

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
    GetManagedObjects: () => Promise<Record<string, Interfaces>>
  },
  events: {
    InterfacesAdded: (path: string, interfaces: Interfaces) => void;
  };
}

export type Adapter = OutputApi<AdapterApi>;
export type ObjectManager = OutputApi<ObjectManagerApi>;

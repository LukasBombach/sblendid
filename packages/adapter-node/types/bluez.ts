import { InterfaceApi } from "./dbus";

export interface Device1Props {
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
  "org.bluez.Device1"?: Device1Props;
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

export interface Device1Api {
  methods: {
    Connect: () => Promise<void>;
    Disconnect: () => Promise<void>;
  };
  properties: {
    // Adapter: { type: "o"; access: "read" };
    // Appearance: { type: "q"; access: "read" };
    // Class: { type: "u"; access: "read" };
    // ManufacturerData: { type: "a{qv}"; access: "read" };
    // ServiceData: { type: "a{sv}"; access: "read" };
    Address: string;
    AddressType: string;
    Alias: string;
    Blocked: boolean;
    Connected: boolean;
    Icon: string;
    LegacyPairing: boolean;
    Modalias: string;
    Name: string;
    Paired: boolean;
    RSSI?: number;
    ServicesResolved: boolean;
    Trusted: boolean;
    TxPower: number;
    UUIDs: string[];
  };
}

export type Adapter = InterfaceApi<AdapterApi>;
export type ObjectManager = InterfaceApi<ObjectManagerApi>;
export type ManagedObjects = Record<string, Record<string, Interfaces>>;

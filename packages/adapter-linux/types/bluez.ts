export interface AdapterInterface {
  name: "org.bluez.Adapter1";
  events: {};
  properties: {};
  methods: {
    StartDiscovery: (callback: (err: Error | null) => void) => void;
    StopDiscovery: (callback: (err: Error | null) => void) => void;
  };
}

export interface ObjectManagerInterface {
  name: "org.freedesktop.DBus.ObjectManager";
  events: {
    InterfacesAdded: (path: string, interfaces: BluezDBusInterfaces) => void;
  };
  properties: {};
  methods: {
    GetManagedObjects: (
      callback: (err: Error | null, managedObjects: ManagedObjects) => void
    ) => void;
  };
}

export type BluezInterfaces = AdapterInterface | ObjectManagerInterface;

export type Name<T extends BluezInterfaces> = T["name"];

export type Events<T extends BluezInterfaces> = T["events"];

export type EventName<T extends BluezInterfaces> = keyof T["events"];

export type EventCallback<
  T extends BluezInterfaces,
  E extends EventName<T>
> = T["events"][E];

export type Methods<T extends BluezInterfaces> = T["methods"];

export type MethodName<T extends BluezInterfaces> = keyof T["methods"];

export type Method<
  T extends BluezInterfaces,
  M extends MethodName<T>
> = T["methods"][M];

export type MethodParameters<
  T extends BluezInterfaces,
  M extends MethodName<T>
> = Method<T, M> extends (...args: infer P) => any ? P : never;

export type Properties<T extends BluezInterfaces> = T["properties"];

export type PropertyName<T extends BluezInterfaces> = keyof T["properties"];

export type PropertyValue<
  T extends BluezInterfaces,
  N extends PropertyName<T>
> = keyof T["properties"][N];

export interface BluezDBusInterfaces {
  "org.bluez.Device1"?: BluezDevice;
  "org.bluez.GattService1"?: BluezService;
  "org.bluez.GattCharacteristic1"?: BluezCharacteristic;
}

export type ManagedObjects = Record<
  string,
  Record<string, BluezDBusInterfaces>
>;

export interface BluezDevice {
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

export interface BluezService {
  Device: string;
  Primary: boolean;
  UUID: SUUID;
}

export interface BluezCharacteristic {
  UUID: CUUID;
  Service: BluezService;
  Flags: ("read" | "write" | "notify")[];
}

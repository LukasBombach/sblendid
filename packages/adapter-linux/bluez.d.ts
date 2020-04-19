interface BluezInterfaces {
  "org.bluez.Device1"?: BluezDevice;
  "org.bluez.GattService1"?: BluezService;
  "org.bluez.GattCharacteristic1"?: BluezCharacteristic;
}

interface BluezDevice {
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

interface BluezService {
  Device: string;
  Primary: boolean;
  UUID: SUUID;
}

interface BluezCharacteristic {
  UUID: CUUID;
  Service: BluezService;
  Flags: ("read" | "write" | "notify")[];
}

import { DBusInterface, DBusError } from "dbus";
import SystemBus from "./systemBus";

interface DBusObjectManager extends DBusInterface {
  GetManagedObjects: (
    callback: (error: DBusError, interfaces: BluezInterfaces) => void
  ) => void;
}

export interface Device {
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

export interface Service {
  UUID: string;
  Device: string;
  Primary: boolean;
  Includes: any[];
}

export interface BluezInterfaces {
  "org.bluez.Device1"?: Device;
  "org.bluez.GattService1"?: Service;
}

type Event = "InterfacesAdded";
type Listener = (...params: any[]) => void;

const ifaceParams = {
  service: "org.bluez",
  path: "/",
  name: "org.freedesktop.DBus.ObjectManager"
};

export default class ObjectManager {
  private systemBus = new SystemBus();
  private objectManager?: DBusObjectManager;

  public async getManagedObjects(): Promise<BluezInterfaces> {
    const objectManager = await this.getObjectManager();
    return new Promise((resolve, reject) => {
      objectManager.GetManagedObjects((err, interfaces) =>
        err ? reject(err) : resolve(interfaces)
      );
    });
  }

  public async on(event: Event, listener: Listener): Promise<void> {
    const objectManager = await this.getObjectManager();
    objectManager.on(event, listener);
  }

  public async off(event: Event, listener: Listener): Promise<void> {
    const objectManager = await this.getObjectManager();
    objectManager.off(event, listener);
  }

  private async getObjectManager(): Promise<DBusObjectManager> {
    if (!this.objectManager) {
      this.objectManager = await this.fetchObjectManager();
    }
    return this.objectManager;
  }

  private async fetchObjectManager(): Promise<DBusObjectManager> {
    return await this.systemBus.getInterface<DBusObjectManager>(ifaceParams);
  }
}
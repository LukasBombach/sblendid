import { DBusInterface, DBusError } from "dbus";
import SystemBus from "./systemBus";

interface DBusObjectManager extends DBusInterface {
  GetManagedObjects: (
    callback: (error: DBusError, interfaces: Interfaces) => void
  ) => void;
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

export interface Interfaces {
  "org.bluez.Device1"?: Device1;
  "org.bluez.GattService1"?: GattService1;
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
  private objManager?: DBusObjectManager;

  public async getManagedObjects(): Promise<Interfaces> {
    const objManager = await this.getObjectManager();
    const getManagedObjects = objManager.GetManagedObjects.bind(objManager);
    return new Promise((res, rej) =>
      getManagedObjects((err, interfaces) => (err ? rej(err) : res(interfaces)))
    );
  }

  public async on(event: Event, listener: Listener): Promise<void> {
    const objManager = await this.getObjectManager();
    objManager.on(event, listener);
  }

  public async off(event: Event, listener: Listener): Promise<void> {
    const objManager = await this.getObjectManager();
    objManager.off(event, listener);
  }

  private async getObjectManager(): Promise<DBusObjectManager> {
    if (!this.objManager) this.objManager = await this.fetchObjectManager();
    return this.objManager;
  }

  private async fetchObjectManager(): Promise<DBusObjectManager> {
    try {
      return await this.systemBus.getInterface<DBusObjectManager>(ifaceParams);
    } catch (error) {
      throw new Error(`Could not get Object Manager. ${error.message}`);
    }
  }
}

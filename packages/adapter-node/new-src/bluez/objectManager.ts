import { EventEmitter } from "events";
import { DBusInterface, DBusError } from "dbus";
import SystemBus from "./systemBus";

interface DBusObjectManager extends DBusInterface {
  GetManagedObjects: (
    callback: (error: DBusError, interfaces: BluezInterfaces) => void
  ) => void;
}

interface Device1 {
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

interface GattService1 {
  UUID: string;
  Device: string;
  Primary: boolean;
  Includes: any[];
}

interface BluezInterfaces {
  "org.bluez.Device1"?: Device1;
  "org.bluez.GattService1"?: GattService1;
}

type Event = "discover";

export default class ObjectManager {
  private emitter?: EventEmitter;
  private systemBus = new SystemBus();
  private objectManager?: DBusObjectManager;

  public async on(
    event: Event,
    listener: (...params: any[]) => void
  ): Promise<void> {}

  /* public async init() {
    const objectManager = await this.getObjectManager();
    const managedObjects = await this.getManagedObjects();
    const entries = Object.entries(managedObjects);
    objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
    entries.forEach(([path, iface]) => this.onInterfacesAdded(path, iface));
  } */

  /* private onInterfacesAdded(path: string, interfaces: BluezInterfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    if (device) this.handleDevice(device, path);
    if (service) this.handleService(service);
  } */

  /* private handleDevice(device: Device, path: string): void {
    const noblePeripheral = this.getNoblePeripheral(device);
    const [pUUID] = noblePeripheral;
    this.devices[pUUID] = path;
    this.emitter.emit("discover", ...noblePeripheral);
  }

  private handleService(service: Service): void {
    const { UUID, Device } = service;
    this.services[Device] = this.services[Device] || new Set();
    this.services[Device].add(UUID);
  } */

  private getEmitter(): Promise<EventEmitter> {
    if (!this.emitter) {
      this.emitter = new EventEmitter();
    }
  }

  private async setupEvents(): Promise<void> {
    const objectManager = await this.getObjectManager();
    const managedObjects = await this.getManagedObjects();
    const entries = Object.entries(managedObjects);
    objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
    entries.forEach(([path, iface]) => this.onInterfacesAdded(path, iface));
  }

  private getManagedObjects(): Promise<BluezInterfaces> {
    return new Promise(async (resolve, reject) => {
      const objectManager = await this.getObjectManager();
      objectManager.GetManagedObjects((err, interfaces) =>
        err ? reject(err) : resolve(interfaces)
      );
    });
  }

  private async getObjectManager(): Promise<DBusObjectManager> {
    if (!this.objectManager) {
      this.objectManager = await this.systemBus.getInterface<DBusObjectManager>(
        "org.bluez",
        "/",
        "org.freedesktop.DBus.ObjectManager"
      );
    }
    return this.objectManager;
  }
}

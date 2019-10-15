import { EventEmitter } from "events";
import { promisify } from "util";
import { NotInitializedError } from "./errors";
import DBus, { DBusInterface } from "dbus";

type GetInterface = (
  serviceName: string,
  objectPath: string,
  interfaceName: string
) => Promise<DBusInterface>;

interface Interfaces {
  "org.bluez.Device1"?: any;
}

const bus = DBus.getBus("system");
const getInterface: GetInterface = promisify(bus.getInterface.bind(bus));

export default class Bluez extends EventEmitter {
  public startDiscovery: () => Promise<unknown> = this.NiN("startDiscovery");
  public stopDiscovery: () => Promise<unknown> = this.NiN("stopDiscovery");

  public static async init(): Promise<Bluez> {
    const bluez = new Bluez();
    await bluez.init();
    return bluez;
  }

  public async init(): Promise<void> {
    const adapter = await this.getAdapter();
    this.startDiscovery = promisify(adapter.StartDiscovery.bind(adapter));
    this.stopDiscovery = promisify(adapter.StopDiscovery.bind(adapter));
    await this.setupEvents();
  }

  private async setupEvents(): Promise<void> {
    const objectManager = await this.getObjectManager();
    objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  private onInterfacesAdded(path: any, interfaces: Interfaces): void {
    const device = "org.bluez.Device1";
    if (interfaces[device]) this.emit("discover", interfaces[device]);
  }

  private getAdapter(): Promise<DBusInterface> {
    return getInterface("org.bluez", "/org/bluez/hci0", "org.bluez.Adapter1");
  }

  private getObjectManager(): Promise<DBusInterface> {
    return getInterface("org.bluez", "/", "org.freedesktop.DBus.ObjectManager");
  }

  private NiN(name: string): () => Promise<never> {
    return () => Promise.reject(new NotInitializedError(name));
  }
}

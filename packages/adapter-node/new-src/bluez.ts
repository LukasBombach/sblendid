import { EventEmitter } from "events";
import { promisify } from "util";
import { NotInitializedError } from "./errors";
import DBus from "dbus";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export default class Bluez extends EventEmitter {
  public startDiscovery: () => Promise<unknown> = this.NiN("startDiscovery");
  public stopDiscovery: () => Promise<unknown> = this.NiN("stopDiscovery");

  public async init() {
    const adapter = await this.getAdapter();
    const objectManager = await this.getObjectManager();
    this.startDiscovery = promisify(adapter.StartDiscovery.bind(adapter));
    this.stopDiscovery = promisify(adapter.StopDiscovery.bind(adapter));
    objectManager.on("InterfacesAdded", (path: any, interfaces: any) => {
      if ("org.bluez.Device1" in interfaces) {
        this.emit("discover", interfaces["org.bluez.Device1"]);
      }
    });
  }

  private getAdapter(): Promise<DBus.DBusInterface> {
    return getInterface("org.bluez", "/org/bluez/hci0", "org.bluez.Adapter1");
  }

  private getObjectManager(): Promise<DBus.DBusInterface> {
    return getInterface("org.bluez", "/", "org.freedesktop.DBus.ObjectManager");
  }

  private NiN(name: string) {
    return () => {
      throw new NotInitializedError(name);
    };
  }
}

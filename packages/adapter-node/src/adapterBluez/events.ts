import { EventEmitter } from "events";
import ObjectManager, {
  Interfaces,
  Device1,
  GattService1
} from "./objectManager";
import Device from "./device";
import Service from "./service";
import List from "./list";

export default class Events extends EventEmitter {
  private objectManager = new ObjectManager();
  private devices = new List<Device>();
  private services = new List<Service>();

  constructor() {
    super();
    this.objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
    this.on("newListener", () => this.emitManagedObjects());
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.objectManager.getManagedObjects();
    const entries = Object.entries(managedObjects);
    console.log("Got managedObjects", managedObjects);
    entries.forEach(([path, iface]) => this.onInterfacesAdded(path, iface));
  }

  private onInterfacesAdded(path: string, interfaces: Interfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    if (device) this.handleDevice(path, device);
    if (service) this.handleService(service);
  }

  private handleDevice(path: string, device1: Device1): void {
    const device = new Device(path, device1);
    this.devices.add(device);
    this.emit("discover", device.getNobleParams());
  }

  private handleService(gattService1: GattService1): void {
    const service = new Service(gattService1);
    this.services.add(service);
  }
}

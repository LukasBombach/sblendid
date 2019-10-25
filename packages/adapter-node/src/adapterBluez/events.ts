import { EventEmitter } from "events";
import ObjectManager, {
  BluezInterfaces,
  Device1,
  GattService1
} from "./objectManager";
import Device from "./device";

export default class Events extends EventEmitter {
  private objectManager = new ObjectManager();

  constructor() {
    super();
    this.objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
    this.on("newListener", () => this.emitManagedObjects());
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.objectManager.getManagedObjects();
    const entries = Object.entries(managedObjects);
    entries.forEach(([path, iface]) => this.onInterfacesAdded(path, iface));
  }

  private onInterfacesAdded(path: string, interfaces: BluezInterfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    if (device) this.handleDevice(device, path);
    if (service) this.handleService(service);
  }

  private handleDevice(deviceInterface: Device1, path: string): void {
    const device = new Device(deviceInterface);
    this.devices.add(device);
    this.emit("discover", device.getNobleParams());
  }

  private handleService(serviceInterface: GattService1): void {
    const service = new Service(serviceInterface);
    this.services.add(service);
  }
}

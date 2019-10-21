import { EventEmitter } from "events";
import { Event, Listener } from "../types/nobleAdapter";
import ObjectManager, {
  BluezInterfaces,
  Device,
  Service
} from "./objectManager";

export default class Events extends EventEmitter {
  private objectManager: ObjectManager;

  constructor(objectManager: ObjectManager) {
    super();
    this.objectManager = objectManager;
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

  private handleDevice(device: Device, path: string): void {
    const noblePeripheral = this.getNoblePeripheral(device);
    const [pUUID] = noblePeripheral;
    this.devices[pUUID] = path;
    this.emit("discover", ...noblePeripheral);
  }

  private handleService(service: Service): void {
    const { UUID, Device } = service;
    this.services[Device] = this.services[Device] || new Set();
    this.services[Device].add(UUID);
  }
}

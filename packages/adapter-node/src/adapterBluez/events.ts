import { EventEmitter } from "events";
import { Event, Listener } from "../types/noble";
import ObjectManager, {
  Interfaces,
  Device1,
  GattService1
} from "./objectManager";
import Device from "./device";
import Service from "./service";
import List from "./list";

export default class Events {
  private objectManager = new ObjectManager();
  private emitter = new EventEmitter();
  private devices = new List<Device>();
  private services = new List<Service>();

  public async init(): Promise<void> {
    const onInterfacesAdded = this.onInterfacesAdded.bind(this);
    await this.objectManager.on("InterfacesAdded", onInterfacesAdded);
    this.emitter.on("newListener", () => this.emitManagedObjects());
  }

  public on<E extends Event>(event: E, listener: Listener<E>): void {
    this.emitter.on(event, listener);
  }

  public off<E extends Event>(event: E, listener: Listener<E>): void {
    this.emitter.off(event, listener);
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.objectManager.getManagedObjects();
    const entries = Object.entries(managedObjects);
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
    this.emitter.emit("discover", device.getNobleParams());
  }

  private handleService(gattService1: GattService1): void {
    const service = new Service(gattService1);
    this.services.add(service);
  }
}

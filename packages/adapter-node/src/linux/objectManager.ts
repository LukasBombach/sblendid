import { EventEmitter } from "events";
import Bluez from "./bluez";
import Device from "./device";
import Service from "./service";
import Characteristic from "./characteristic";
import type { Interfaces } from "./bluez";
import type { ObjectManagerEvents as Events } from "./bluez";
import type { ObjectManager as ObjectManagerInterface } from "./bluez";

export default class ObjectManager {
  private emitter = new EventEmitter();
  private eventsAreSetUp = false;
  private interface?: ObjectManagerInterface;

  async on<K extends keyof Events>(
    event: K,
    listener: (err: Error, value: Events[K]) => void
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.on(event, listener);
    this.emitManagedObjects();
  }

  async off<K extends keyof Events>(
    event: K,
    listener: (err: Error, value: Events[K]) => void
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.off(event, listener);
  }

  private onInterfacesAdded(path: string, interfaces: Interfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    const characteristic = interfaces["org.bluez.GattCharacteristic1"];
    if (device) this.handleDevice(path, device);
    if (service) this.handleService(path, service);
    if (characteristic) this.handleCharacteristic(path, characteristic);
  }

  private handleDevice(path: string, device1: Device1): void {
    const device = new Device(path, device1);
    Device.add(device);
    this.emitter.emit("discover", ...device.toNoble());
  }

  private handleService(path: string, gattService1: GattService1): void {
    const service = new Service(path, gattService1);
    Service.add(service);
    this.emitter.emit("service", service);
  }

  private handleCharacteristic(
    path: string,
    gattCharacteristic1: GattCharacteristic1
  ): void {
    const characteristic = new Characteristic(path, gattCharacteristic1);
    Characteristic.add(characteristic);
    this.emitter.emit("characteristic", characteristic);
  }

  private async setupEvents(): Promise<void> {
    if (this.eventsAreSetUp) return;
    this.eventsAreSetUp = true;
    const iface = await this.getInterface();
    iface.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.getManagedObjects();
    const entries = Object.entries(managedObjects);
    for (const [path, interfaces] of entries) {
      this.onInterfacesAdded(path, interfaces);
    }
  }

  private async getManagedObjects(): Promise<ManagedObjects> {
    const iface = await this.getInterface();
    return await iface.GetManagedObjects();
  }

  private async getInterface(): Promise<ObjectManagerInterface> {
    if (!this.interface) this.interface = await Bluez.getObjectManager();
    return this.interface;
  }
}

import { EventEmitter } from "events";
import Bluez from "./bluez";
import {
  ObjectManager as Interface,
  ManagedObjects,
  GattService1
} from "../../types/bluez";
import { Interfaces, Device1Props } from "../../types/bluez";
import Emitter, { Events, Listener } from "../../types/emitter";
import { Params } from "../../types/noble";
import Device from "./device";
import Service from "./service";

export interface Api {
  discover: (...peripheral: Params<"discover">) => void;
  service: (service: Service) => void;
}

export default class ObjectManager extends Emitter<Api> {
  private bluez = new Bluez();
  private emitter = new EventEmitter();
  private interface?: Interface;
  private eventsAreSetUp = false;

  public async setupEvents(): Promise<void> {
    if (this.eventsAreSetUp) return;
    this.eventsAreSetUp = true;
    const iface = await this.getInterface();
    iface.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  public async on<E extends Events<Emitter<Api>>>(
    event: E,
    listener: Listener<Emitter<Api>, E>
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.on(event, listener);
    this.emitManagedObjects();
  }

  public async off<E extends Events<Emitter<Api>>>(
    event: E,
    listener: Listener<Emitter<Api>, E>
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.off(event, listener);
  }

  private onInterfacesAdded(path: string, interfaces: Interfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    if (device) this.handleDevice(path, device);
    if (service) this.handleService(path, service);
  }

  private handleDevice(path: string, device1: Device1Props): void {
    const device = new Device(path, device1);
    Device.add(device);
    this.emitter.emit("discover", ...device.toNoble());
  }

  private handleService(path: string, gattService1: GattService1): void {
    const service = new Service(path, gattService1);
    Service.add(service);
    this.emitter.emit("service", service);
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

  private async getInterface(): Promise<Interface> {
    if (!this.interface) this.interface = await this.bluez.getObjectManager();
    return this.interface;
  }
}

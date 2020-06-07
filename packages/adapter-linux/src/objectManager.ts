import { EventEmitter } from "events";
import BluezInterface from "./bluezInterface";

import type { BluezDevice } from "../types/bluez";
import type { BluezService } from "../types/bluez";
import type { BluezCharacteristic } from "../types/bluez";
import type { BluezDBusInterfaces } from "../types/bluez";
import type { EventName, EventCallback } from "../types/bluez";
import type { ObjectManagerInterface } from "../types/bluez";

type I = ObjectManagerInterface;

const name = "org.freedesktop.DBus.ObjectManager";
const path = "/";

export default class ObjectManager {
  private manager = new BluezInterface<ObjectManagerInterface>(name, path);
  private emitter = new EventEmitter();
  private eventsAreSetUp = false;

  private devices: Record<string, BluezDevice> = {};
  private services: Record<string, BluezService> = {};
  private characteristics: Record<string, BluezCharacteristic> = {};

  async on<E extends EventName<I>>(
    event: E,
    listener: EventCallback<I, E>
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.on(event, listener);
    this.emitManagedObjects();
  }

  async off<E extends EventName<I>>(
    event: E,
    listener: EventCallback<I, E>
  ): Promise<void> {
    this.emitter.off(event, listener);
  }

  private onInterfacesAdded(
    path: string,
    interfaces: BluezDBusInterfaces
  ): void {
    const { device, service, characteristic } = this.getInterfaces(interfaces);
    if (device) this.handleDevice(path, device);
    if (service) this.handleService(path, service);
    if (characteristic) this.handleCharacteristic(path, characteristic);
  }

  private handleDevice(path: string, device1: BluezDevice): void {
    this.devices[path] = device1;
    this.emitter.emit("device1", device1);
  }

  private handleService(path: string, gattService1: BluezService): void {
    this.services[path] = gattService1;
    this.emitter.emit("gattService1", gattService1);
  }

  private handleCharacteristic(
    path: string,
    gattCharacteristic1: BluezCharacteristic
  ): void {
    this.characteristics[path] = gattCharacteristic1;
    this.emitter.emit("gattCharacteristic1", gattCharacteristic1);
  }

  private async setupEvents(): Promise<void> {
    if (this.eventsAreSetUp) return;
    this.eventsAreSetUp = true;
    await this.manager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  private getInterfaces(interfaces: BluezDBusInterfaces) {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    const characteristic = interfaces["org.bluez.GattCharacteristic1"];
    return { device, service, characteristic };
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.manager.call("GetManagedObjects");
    const entries = Object.entries(managedObjects);
    for (const [path, interfaces] of entries) {
      this.onInterfacesAdded(path, interfaces);
    }
  }
}

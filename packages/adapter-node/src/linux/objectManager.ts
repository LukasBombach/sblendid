import { EventEmitter } from "events";
import Bluez from "./bluez";
import { ObjectManager as Interface } from "../../types/bluez";
import { Interfaces, Device1 } from "../../types/bluez";
import Emitter, { Events, Listener } from "../../types/emitter";
import { Params } from "../../types/noble";
import Device from "./device";

export interface Api {
  discover: (...peripheral: Params<"discover">) => void;
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
    if (device) this.handleDevice(path, device);
  }

  private handleDevice(path: string, device1: Device1): void {
    const device = new Device(path, device1);
    Device.add(device);
    this.emitter.emit("discover", ...device.toNoble());
  }

  private async getInterface(): Promise<Interface> {
    if (!this.interface) this.interface = await this.bluez.getObjectManager();
    return this.interface;
  }
}

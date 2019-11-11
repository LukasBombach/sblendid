import { EventEmitter } from "events";
import Bluez from "./bluez";
import { ObjectManager as Interface } from "../../types/bluez";
import { Interfaces, Device1 } from "../../types/bluez";
import Device from "./device";

interface Callbacks {
  device: (device: Device) => void;
}

type Event = keyof Callbacks;
type Callback<E extends Event> = Callbacks[E];

export default class ObjectManager {
  private bluez = new Bluez();
  private emitter = new EventEmitter();
  private interface?: Interface;

  public async init(): Promise<void> {
    const iface = await this.getInterface();
    iface.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  public on<E extends Event>(event: E, listener: Callback<E>) {
    this.emitter.on(event, listener);
  }

  public off<E extends Event>(event: E, listener: Callback<E>) {
    this.emitter.off(event, listener);
  }

  private onInterfacesAdded(path: string, interfaces: Interfaces): void {
    const device = interfaces["org.bluez.Device1"];
    if (device) this.handleDevice(path, device);
  }

  private handleDevice(path: string, device1: Device1): void {
    const device = new Device(path, device1);
    Device.add(device);
    this.emitter.emit("device", device);
  }

  private async getInterface(): Promise<Interface> {
    if (!this.interface) this.interface = await this.bluez.getObjectManager();
    return this.interface;
  }
}

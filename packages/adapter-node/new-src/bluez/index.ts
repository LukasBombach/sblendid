import BluezAdapter from "./adapter";
import ObjectManager from "./objectManager";
import { Event, Listener } from "../types/nobleAdapter";

export class Bluez {
  private adapter = new BluezAdapter();
  private objectManager = new ObjectManager();

  public async init(): Promise<void> {}

  public async startScanning(): Promise<void> {
    await this.adapter.startDiscovery();
  }

  public async stopScanning(): Promise<void> {
    await this.adapter.stopDiscovery();
  }

  public async on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    this.objectManager.on(event, listener);
  }
}

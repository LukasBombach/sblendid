/// <reference path="../types/global.d.ts" />
import { Event, Params, Listener } from "../types/noble";
import Adapter, { FindCondition, Characteristic } from "../adapter";
import BluezAdapter from "./adapter";
import Events from "./events";
import Device from "./device";

export default class Bluez extends Adapter {
  private adapter = new BluezAdapter();
  private events = new Events();

  public async init(): Promise<void> {
    await this.events.init();
  }

  public async startScanning(): Promise<void> {
    await this.adapter.startDiscovery();
  }

  public async stopScanning(): Promise<void> {
    await this.adapter.stopDiscovery();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    return await this.run<"discover">(
      () => this.startScanning(),
      () => this.when("discover", condition),
      () => this.stopScanning()
    );
  }

  public async connect(pUUID: PUUID): Promise<void> {
    const device = Device.find(pUUID);
    const msg = `The device with the UUID "${pUUID}" has not been discovered yet`;
    if (!device) throw new Error(msg);
    await device.connect();
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    const device = Device.find(pUUID);
    const msg = `The device with the UUID "${pUUID}" has not been discovered yet`;
    if (!device) throw new Error(msg);
    await device.disconnect();
  }

  public getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet");
  }

  public getServices(pUUID: PUUID): Promise<SUUID[]> {
    throw new Error("Not implemented yet");
  }

  public getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    throw new Error("Not implemented yet");
  }

  public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    throw new Error("Not implemented yet");
  }

  public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    throw new Error("Not implemented yet");
  }

  protected on<E extends Event>(event: E, listener: Listener<E>): void {
    this.events.on(event, listener);
  }

  protected off<E extends Event>(event: E, listener: Listener<E>): void {
    this.events.off(event, listener);
  }
}

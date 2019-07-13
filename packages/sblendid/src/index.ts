import BindingsMacOs from "sblendid-bindings-macos";
import Peripheral from "./peripheral";
import Adapter from "./adapter";
import { Advertisement, EventName, EventListener } from "../types/bindings";

export type ScanListener = (error: Error, peripheral: Peripheral) => void;

export default class Sblendid {
  public static adapter: Adapter = new Adapter(BindingsMacOs);
  private scanListener?: ScanListener;

  static async connect(name: string): Promise<Peripheral> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    const peripheral = await sblendid.find(name);
    await peripheral.connect();
    return peripheral;
  }

  public async powerOn(): Promise<void> {
    await Promise.all([
      Sblendid.adapter.when("stateChange", "poweredOn"),
      Sblendid.adapter.bindings.init()
    ]);
  }

  public async find(name: string): Promise<Peripheral> {
    const [peripheral] = await Promise.all([
      Sblendid.adapter.when("discover", (...arg) => this.hasName(arg[4], name)),
      Sblendid.adapter.bindings.startScanning()
    ]);
    Sblendid.adapter.bindings.stopScanning();
    return new Peripheral(...peripheral);
  }

  public startScanning(listener?: ScanListener): void {
    if (this.scanListener) Sblendid.adapter.off("discover", this.scanListener);
    if (listener) Sblendid.adapter.on("discover", listener);
    this.scanListener = listener;
    Sblendid.adapter.bindings.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) Sblendid.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    Sblendid.adapter.bindings.stopScanning();
  }

  public on<E extends EventName>(event: E, listener: EventListener<E>): void {
    Sblendid.adapter.on(event, listener);
  }

  public off<E extends EventName>(event: E, listener: EventListener<E>): void {
    Sblendid.adapter.off(event, listener);
  }

  public once<E extends EventName>(event: E, listener: EventListener<E>): void {
    Sblendid.adapter.once(event, listener);
  }

  private hasName(advertisement: Advertisement, name: string): boolean {
    return advertisement.localName === name;
  }
}

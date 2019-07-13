import BindingsMacOs from "sblendid-bindings-macos";
import Peripheral from "./peripheral";
import { NoblePeripheral } from "../types/noble";
import UnboundAdapter, { Adapter } from "./adapter";

export type ScanListener = (error: Error, peripheral: Peripheral) => void;

export default class Sblendid {
  public static adapter: Adapter = UnboundAdapter.withBindings(BindingsMacOs);
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
      Sblendid.adapter.init()
    ]);
  }

  public async find(name: string): Promise<Peripheral> {
    const [noblePeripheral] = await Promise.all([
      Sblendid.adapter.when("discover", p => this.hasName(p, name)),
      Sblendid.adapter.startScanning()
    ]);
    Sblendid.adapter.stopScanning();
    return new Peripheral(noblePeripheral);
  }

  public startScanning(listener?: ScanListener): void {
    if (this.scanListener) Sblendid.adapter.off("discover", this.scanListener);
    if (listener) Sblendid.adapter.on("discover", listener);
    this.scanListener = listener;
    Sblendid.adapter.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) Sblendid.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    Sblendid.adapter.stopScanning();
  }

  public on(name: keyof NobleAdapterEvents, listener: ScanListener): void {
    Sblendid.adapter.on(name, listener);
  }

  public off(name: keyof NobleAdapterEvents, listener: ScanListener): void {
    Sblendid.adapter.off(name, listener);
  }

  private hasName(noblePeripheral: NoblePeripheral, name: string): boolean {
    return noblePeripheral.advertisement.localName === name;
  }
}

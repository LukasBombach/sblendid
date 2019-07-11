import Adapter from "./adapter";
import Peripheral from "./peripheral";
import { NoblePeripheral } from "../types/noble";

export type ScanListener = (peripheral: Peripheral) => void;

export default class Sblendid {
  public adapter: Adapter;
  private scanListener?: ScanListener;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
  }

  static async connect(name: string): Promise<Peripheral> {
    const adapter = new Adapter();
    const sblendid = new Sblendid(adapter);
    await sblendid.powerOn();
    return await sblendid.connect(name);
  }

  public async powerOn(): Promise<void> {
    await Promise.all([
      this.adapter.when("stateChange", "poweredOn"),
      this.adapter.init()
    ]);
  }

  public async find(name: string): Promise<Peripheral> {
    const [noblePeripheral] = await Promise.all([
      this.adapter.when("discover", p => this.isName(p, name)),
      this.adapter.startScanning()
    ]);
    return Peripheral.fromNoble(noblePeripheral);
  }

  public async connect(name: string): Promise<Peripheral> {
    const peripheral = await this.find(name);
    await peripheral.connect();
    return peripheral;
  }

  public startScanning(listener?: ScanListener): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    if (listener) this.adapter.on("discover", listener);
    this.scanListener = listener;
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    this.adapter.stopScanning();
  }

  private isName(noblePeripheral: NoblePeripheral, name: string): boolean {
    return noblePeripheral.advertisement.localName === name;
  }
}

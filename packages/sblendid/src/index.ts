import MacOs from "sblendid-bindings-macos";
import Adapter, { DiscoverListener } from "./adapter";
import Peripheral from "./peripheral";
import Bindings from "../types/bindings";

export default class Sblendid {
  public adapter: Adapter;
  private scanListener?: DiscoverListener;

  static async connect(name: string, bindings?: Bindings): Promise<Peripheral> {
    const sblendid = new Sblendid(bindings);
    await sblendid.powerOn();
    const peripheral = await sblendid.find(name);
    await peripheral.connect();
    return peripheral;
  }

  constructor(bindings?: Bindings) {
    this.adapter = Adapter.withBindings(bindings || MacOs.bindings);
  }

  public async powerOn(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.init(),
      () => this.adapter.when("stateChange", "poweredOn")
    );
  }

  public async find(name: string): Promise<Peripheral> {
    return await this.adapter.run<"discover">(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", peripheral => peripheral.name === name, { map: true }),
      () => this.adapter.stopScanning()
    );
  }

  public startScanning(listener?: DiscoverListener): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    if (listener) this.adapter.on("discover", listener, { map: true });
    this.scanListener = listener;
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    this.adapter.stopScanning();
  }
}

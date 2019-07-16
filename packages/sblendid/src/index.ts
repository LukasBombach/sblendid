import MacOs from "sblendid-bindings-macos";
import Bindings, { EventListener, EventParameters } from "../types/bindings";
import Peripheral from "./peripheral";
import Adapter from "./adapter";

type DiscoverListener = EventListener<"discover">;
type DiscoverParams = EventParameters<"discover">;

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
    const peripheral = await this.adapter.run<"discover">(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", (...a) => a[4].localName === name),
      () => this.adapter.stopScanning()
    );
    return new Peripheral(this.adapter, ...peripheral);
  }

  public startScanning(listener?: DiscoverListener): void {
    const mapEventToPeripheral = (...p: DiscoverParams) => new Peripheral(this.adapter, ...p);
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    if (listener) this.adapter.on("discover", listener, mapEventToPeripheral);
    this.scanListener = listener;
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    this.adapter.stopScanning();
  }
}

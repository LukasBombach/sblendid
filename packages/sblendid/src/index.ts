import * as MacOs from "sblendid-bindings-macos";
import { Bindings, EventListener, EventParameters } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Peripheral from "./peripheral";

export type ScanListener = (peripheral: Peripheral) => void;

export default class Sblendid {
  public adapter: Adapter;
  private scanListener?: EventListener<"discover">;

  static async connect(name: string /* , bindings?: Bindings */): Promise<Peripheral> {
    const sblendid = new Sblendid(/* bindings */);
    await sblendid.powerOn();
    const peripheral = await sblendid.find(name);
    await peripheral.connect();
    return peripheral;
  }

  constructor(/* bindings?: Bindings */) {
    //this.adapter = Adapter.withBindings(bindings || MacOs.bindings);
    this.adapter = new Adapter();
  }

  public async powerOn(): Promise<void> {
    await this.adapter.run(
      () => {
        console.log("calling init");
        this.adapter.init();
      },
      () => {
        return this.adapter.when("stateChange", ([state]) => {
          console.log(state);
          return state === "poweredOn";
        });
      }
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

  public startScanning(scanListener?: ScanListener): void {
    const listener = this.getDiscoverListener(scanListener);
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

  private getDiscoverListener(scanListener?: ScanListener): EventListener<"discover"> | undefined {
    if (!scanListener) return undefined;
    return (...args: EventParameters<"discover">): void => {
      scanListener(new Peripheral(this.adapter, ...args));
    };
  }
}

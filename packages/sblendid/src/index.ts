import { EventListener, EventParameters } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Peripheral from "./peripheral";

export { CharacteristicConverter } from "./characteristic";

// todo return value
export type ScanListener = (peripheral: Peripheral) => void | boolean;
export type FindCondition = string | ((peripheral: Peripheral) => boolean);

export default class Sblendid {
  public adapter: Adapter;
  private scanListener?: EventListener<"discover">;

  static async connect(find: FindCondition): Promise<Peripheral> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    const peripheral = await sblendid.find(find);
    await peripheral.connect();
    return peripheral;
  }

  constructor() {
    this.adapter = new Adapter();
  }

  public async powerOn(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.init(),
      () => this.adapter.when("stateChange", ([state]) => state === "poweredOn")
    );
  }

  public async find(find: FindCondition): Promise<Peripheral> {
    const condition = (args: EventParameters<"discover">) =>
      typeof find === "string"
        ? this.isPeripheral(args, find)
        : find(new Peripheral(this.adapter, ...args));
    const peripheral = await this.adapter.run<"discover">(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", condition),
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

  private isPeripheral([uuid, , , , advert]: EventParameters<"discover">, name: string) {
    return name === uuid || (advert && advert.localName === name);
  }
}

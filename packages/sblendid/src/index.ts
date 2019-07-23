/// <reference path="./index.d.ts" />

import { EventListener, EventParameters } from "sblendid-bindings-macos";
import Adapter, { Condition } from "./adapter";
import Peripheral from "./peripheral";

export { CharacteristicConverter } from "./characteristic";

export type ScanListener = (peripheral: Peripheral) => void;
export type FindCondition = (peripheral: Peripheral) => Promise<boolean> | boolean;

type DiscoverParams = EventParameters<"discover">;

export default class Sblendid {
  public adapter: Adapter = new Adapter();
  private scanListener?: EventListener<"discover">;

  public static async connect(find: string | FindCondition): Promise<Peripheral> {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(find);
    await peripheral.connect();
    return peripheral;
  }

  public static async powerOn(): Promise<Sblendid> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    return sblendid;
  }

  public async powerOn(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.init(),
      () => this.adapter.when("stateChange", "poweredOn")
    );
  }

  public async find(find: string | FindCondition): Promise<Peripheral> {
    const peripheral = await this.adapter.run<"discover">(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", this.getFindCondition(find)),
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
    return (...args: DiscoverParams) => scanListener(new Peripheral(this.adapter, ...args));
  }

  private getFindCondition(find: string | FindCondition): Condition<"discover"> {
    if (typeof find === "string") return (args: DiscoverParams) => this.isPeripheral(args, find);
    return (args: DiscoverParams) => find(new Peripheral(this.adapter, ...args));
  }

  private isPeripheral([uuid, , , , { localName }]: DiscoverParams, name: string) {
    return name === uuid || localName === name;
  }
}

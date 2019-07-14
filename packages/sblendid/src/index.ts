import BindingsMacOs from "sblendid-bindings-macos";
import Peripheral from "./peripheral";
import Adapter, { Condition } from "./adapter";
import Bindings, {
  Advertisement,
  EventName,
  EventListener,
  EventParameters
} from "../types/bindings";

export type ScanListener = (peripheral: Peripheral) => void;

export default class Sblendid {
  public static adapter: Adapter = new Adapter(BindingsMacOs);
  public static bindings: Bindings = BindingsMacOs;
  private scanListener?: EventListener<"discover">;

  static async connect(name: string): Promise<Peripheral> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    const peripheral = await sblendid.find(name);
    await peripheral.connect();
    return peripheral;
  }

  public async powerOn(): Promise<void> {
    await this.run(
      () => Sblendid.bindings.init(),
      () => this.when("stateChange", "poweredOn")
    );
  }

  public async find(name: string): Promise<Peripheral> {
    const peripheral = await this.run<"discover">(
      () => Sblendid.bindings.startScanning(),
      () => this.when("discover", (...a) => this.hasName(a[4], name)),
      () => Sblendid.bindings.stopScanning()
    );
    return new Peripheral(...peripheral);
  }

  public startScanning(scanListener?: ScanListener): void {
    const listener = this.getDiscoverListener(scanListener);
    if (this.scanListener) Sblendid.adapter.off("discover", this.scanListener);
    if (listener) Sblendid.adapter.on("discover", listener);
    this.scanListener = listener;
    Sblendid.bindings.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) Sblendid.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    Sblendid.bindings.stopScanning();
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

  public when<E extends EventName>(
    event: E,
    condition?: Condition<E>,
    timeout?: number
  ): Promise<EventParameters<E>> {
    return Sblendid.adapter.when(event, condition, timeout);
  }

  // todo types!!!
  public async run<E extends EventName>(
    action: () => void | Promise<void>,
    when: () => Promise<EventParameters<E>>,
    end?: () => void | Promise<void>
  ): Promise<EventParameters<E>> {
    return await Sblendid.adapter.run<E>(action, when, end);
  }

  private getDiscoverListener(
    scanListener?: ScanListener
  ): EventListener<"discover"> | undefined {
    if (!scanListener) return undefined;
    return (...args: EventParameters<"discover">): void => {
      scanListener(new Peripheral(...args));
    };
  }

  private hasName(advertisement: Advertisement, name: string): boolean {
    return advertisement.localName === name;
  }
}

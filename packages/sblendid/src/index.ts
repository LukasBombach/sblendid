import { bindings } from "sblendid-bindings-macos";
import Peripheral from "./peripheral";
import Adapter, { Condition, Action, When, End } from "./adapter";
import Bindings, {
  EventName as Event,
  EventListener as Listener,
  EventParameters as Params
} from "../types/bindings";

export type ScanListener = (peripheral: Peripheral) => void;

export default class Sblendid {
  public static adapter: Adapter = new Adapter(bindings);
  public static bindings: Bindings = bindings;
  private scanListener?: Listener<"discover">;

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
      () => this.when("discover", (...a) => a[4].localName === name),
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

  public on<E extends Event>(event: E, listener: Listener<E>): void {
    Sblendid.adapter.on(event, listener);
  }

  public off<E extends Event>(event: E, listener: Listener<E>): void {
    Sblendid.adapter.off(event, listener);
  }

  public once<E extends Event>(event: E, listener: Listener<E>): void {
    Sblendid.adapter.once(event, listener);
  }

  public when<E extends Event>(
    event: E,
    condition?: Condition<E>,
    timeout?: number
  ): Promise<Params<E>> {
    return Sblendid.adapter.when(event, condition, timeout);
  }

  public async run<E extends Event>(
    action: Action,
    when: When<E>,
    end?: End
  ): Promise<Params<E>> {
    return await Sblendid.adapter.run<E>(action, when, end);
  }

  private getDiscoverListener(
    scanListener?: ScanListener
  ): Listener<"discover"> | undefined {
    if (!scanListener) return undefined;
    return (...args: Params<"discover">): void => {
      scanListener(new Peripheral(...args));
    };
  }
}

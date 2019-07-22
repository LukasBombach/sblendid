import Adapter from "./adapter.new";
import Peripheral from "../src/peripheral";

export { CharacteristicConverter } from "../src/characteristic";

export type DiscoverListener = (peripheral: Peripheral) => void;
export type FindCondition = (peripheral: Peripheral) => boolean;

export default class Sblendid {
  public adapter: Adapter;
  private scanListener?: DiscoverListener;

  public static async connect(find: FindCondition): Promise<Peripheral> {
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
    return ((await this.adapter.run<"discover">(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", find, { convert: true }),
      () => this.adapter.stopScanning()
    )) as any) as Peripheral;
  }

  public startScanning(listener?: DiscoverListener): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    if (listener) this.adapter.on("discover", listener, { convert: true });
    this.scanListener = listener;
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    if (this.scanListener) this.adapter.off("discover", this.scanListener);
    this.scanListener = undefined;
    this.adapter.stopScanning();
  }
}

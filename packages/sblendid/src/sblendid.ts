import { EventListener } from "sblendid-bindings-macos";
import Adapter, { asPeripheral, AsPeripheralListener } from "./adapter";
import Peripheral from "./peripheral";

export default class Sblendid {
  public adapter: Adapter = new Adapter();
  private scanListener: EventListener<"discover"> = () => {};

  public static async powerOn(): Promise<Sblendid> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    return sblendid;
  }

  public static async connect(condition: string | AsPeripheralListener): Promise<Peripheral> {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(condition);
    await peripheral.connect();
    return peripheral;
  }

  public async powerOn(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.init(),
      () => this.adapter.when("stateChange", "poweredOn")
    );
  }

  public async find(condition: string | AsPeripheralListener): Promise<Peripheral> {
    return await this.adapter.run<"discover">(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", asPeripheral(this.getFindCondition(condition)) as any),
      () => this.adapter.stopScanning(),
      peripheral => Peripheral.fromDiscover(this.adapter, peripheral)
    );
  }

  public startScanning(listener: (peripheral: Peripheral) => void = () => {}): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = asPeripheral(listener);
    this.adapter.on("discover", this.scanListener);
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = () => {};
    this.adapter.stopScanning();
  }

  private getFindCondition(condition: string | AsPeripheralListener): AsPeripheralListener {
    if (typeof condition === "function") return condition;
    return ({ uuid, name }: Peripheral) => [uuid, name].includes(condition);
  }
}

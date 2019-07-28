import { Bindings, EventListener } from "sblendid-bindings-macos";
import Adapter, { PeripheralListener } from "./adapter";
import Peripheral from "./peripheral";

export default class Sblendid {
  public adapter: Adapter = new Adapter(new Bindings());
  private scanListener: EventListener<"discover"> = () => {};

  public static async powerOn(): Promise<Sblendid> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    return sblendid;
  }

  public static async connect(
    condition: string | PeripheralListener
  ): Promise<Peripheral> {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(condition);
    await peripheral.connect();
    return peripheral;
  }

  public async powerOn(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.init(),
      () => this.adapter.when("stateChange", state => state === "poweredOn")
    );
  }

  public async find(
    condition: string | PeripheralListener
  ): Promise<Peripheral> {
    return await this.adapter.run<"discover", Peripheral>(
      () => this.adapter.startScanning(),
      () => this.adapter.when("discover", this.getFindCondition(condition)),
      () => this.adapter.stopScanning(),
      peripheral => Peripheral.fromDiscover(this.adapter, peripheral)
    );
  }

  public startScanning(
    listener: (peripheral: Peripheral) => void = () => {}
  ): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = this.adapter.asPeripheral(listener);
    this.adapter.on("discover", this.scanListener);
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = () => {};
    this.adapter.stopScanning();
  }

  private getFindCondition(
    condition: string | PeripheralListener
  ): EventListener<"discover"> {
    if (typeof condition === "function")
      return this.adapter.asPeripheral(condition);
    return this.adapter.asPeripheral(p =>
      [p.uuid, p.address, p.name].includes(condition)
    );
  }
}

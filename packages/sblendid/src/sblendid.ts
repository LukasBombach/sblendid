import Adapter, { Listener } from "@sblendid/adapter-node";
import Peripheral from "./peripheral";

export default class Sblendid {
  public adapter: Adapter = new Adapter();
  private scanListener: Listener<"discover"> = () => {};

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
    await this.adapter.powerOn();
  }

  public async find(
    condition: string | PeripheralListener
  ): Promise<Peripheral> {
    return await this.adapter.find(condition);
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
  ): Listener<"discover"> {
    if (typeof condition === "function")
      return this.adapter.asPeripheral(condition);
    return this.adapter.asPeripheral(p =>
      [p.uuid, p.address, p.name].includes(condition)
    );
  }
}

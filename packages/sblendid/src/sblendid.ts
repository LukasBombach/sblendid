import Adapter, {
  Params,
  Listener,
  FindCondition as AdapterFindCondition
} from "@sblendid/adapter-node";
import Peripheral from "./peripheral";

export type PeripheralListener = (peripheral: Peripheral) => Promish<void>;
export type FindFunction = (peripheral: Peripheral) => Promish<boolean>;
export type FindCondition = FindFunction | string;

export default class Sblendid {
  public adapter: Adapter = new Adapter();
  private scanListener: Listener<"discover"> = () => {};

  public static async powerOn(): Promise<Sblendid> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    return sblendid;
  }

  public static async connect(condition: FindCondition): Promise<Peripheral> {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(condition);
    await peripheral.connect();
    return peripheral;
  }

  public async powerOn(): Promise<void> {
    await this.adapter.powerOn();
  }

  public async find(condition: FindCondition): Promise<Peripheral> {
    const props = await this.adapter.find(this.getFindCondition(condition));
    return Peripheral.fromProps(props);
  }

  public startScanning(listener: PeripheralListener): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = this.asPeripheral(listener);
    this.adapter.on("discover", this.scanListener);
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = () => {};
    this.adapter.stopScanning();
  }

  private getFindCondition(condition: FindCondition): AdapterFindCondition {
    if (typeof condition === "function") return this.asPeripheral(condition);
    return this.asPeripheral(p =>
      [p.uuid, p.address, p.name].includes(condition)
    );
  }

  private asPeripheral(listener: PeripheralListener): Listener<"discover"> {
    return (...args: Params<"discover">) =>
      listener(Peripheral.fromDiscover(this.adapter, args));
  }
}

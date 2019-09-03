import Adapter, {
  Params,
  Listener,
  FindCondition as AdapterFindCondition
} from "@sblendid/adapter-node";
import Peripheral from "./peripheral";

export type PeripheralListener = (peripheral: Peripheral) => Promish<void>;
export type FindFunction = (peripheral: Peripheral) => Promish<boolean>;
export type FindCondition = FindFunction | string;
type PeripheralData = Params<"discover">;

export default class Sblendid {
  private adapter: Adapter = new Adapter();
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
    const adapterCondition = this.getAdapterCondition(condition);
    const peripheralData = await this.adapter.find(adapterCondition);
    return new Peripheral(this.adapter, peripheralData);
  }

  public startScanning(listener?: PeripheralListener): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = this.getDiscoverListener(listener);
    this.adapter.on("discover", this.scanListener);
    this.adapter.startScanning();
  }

  public stopScanning(): void {
    this.adapter.off("discover", this.scanListener);
    this.scanListener = () => {};
    this.adapter.stopScanning();
  }

  private getAdapterCondition(condition: FindCondition): AdapterFindCondition {
    return typeof condition === "string"
      ? this.getConditionFromString(condition)
      : this.getConditionFromFunction(condition);
  }

  private getConditionFromString(str: string): AdapterFindCondition {
    return (...peripheralData: PeripheralData) => {
      const [uuid, address, , , advertisement] = peripheralData;
      const { localName } = advertisement;
      return [uuid, address, localName].includes(str);
    };
  }

  private getConditionFromFunction(fn: FindFunction): AdapterFindCondition {
    return (...peripheralData: PeripheralData) => {
      const peripheral = new Peripheral(this.adapter, peripheralData);
      return fn(peripheral);
    };
  }

  private getDiscoverListener(
    listener: PeripheralListener = () => {}
  ): Listener<"discover"> {
    return (...data: Params<"discover">) =>
      listener(new Peripheral(this.adapter, data));
  }
}

/// <reference path="./types.d.ts" />
import Adapter, {
  Params,
  Listener,
  FindCondition
} from "@sblendid/adapter-node";
import Peripheral, { Options } from "./peripheral";

export type PeripheralListener = (peripheral: Peripheral) => Promish<void>;
export type FindFunction = (peripheral: Peripheral) => Promish<boolean>;
export type Condition = FindFunction | string;

export default class Sblendid {
  public adapter: Adapter = new Adapter();
  private scanListener: Listener<"discover"> = () => {};

  public static async powerOn(): Promise<Sblendid> {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
    return sblendid;
  }

  public static async connect(condition: Condition): Promise<Peripheral> {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(condition);
    await peripheral.connect();
    return peripheral;
  }

  public async powerOn(): Promise<void> {
    await this.adapter.powerOn();
  }

  public async find(condition: Condition): Promise<Peripheral> {
    const adapterCondition = this.getAdapterCondition(condition);
    const discoverParams = await this.adapter.find(adapterCondition);
    const [uuid, options] = this.parseDiscoverParams(discoverParams);
    return new Peripheral(uuid, this.adapter, options);
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

  private getAdapterCondition(condition: Condition): FindCondition {
    return typeof condition === "string"
      ? this.getConditionFromString(condition)
      : this.getConditionFromFunction(condition);
  }

  private getConditionFromString(str: string): FindCondition {
    return (...peripheralData: Params<"discover">) => {
      const [uuid, address, , , advertisement] = peripheralData;
      const { localName } = advertisement;
      return [uuid, address, localName].includes(str);
    };
  }

  private getConditionFromFunction(fn: FindFunction): FindCondition {
    return (...discoverParams: Params<"discover">) => {
      const [uuid, options] = this.parseDiscoverParams(discoverParams);
      const peripheral = new Peripheral(uuid, this.adapter, options);
      return fn(peripheral);
    };
  }

  private getDiscoverListener(
    listener: PeripheralListener = () => {}
  ): Listener<"discover"> {
    return (...discoverParams: Params<"discover">) => {
      const [uuid, options] = this.parseDiscoverParams(discoverParams);
      const peripheral = new Peripheral(uuid, this.adapter, options);
      listener(peripheral);
    };
  }

  private parseDiscoverParams(data: Params<"discover">): [string, Options] {
    const [uuid, address, addressType, connectable, advertisement] = data;
    const options = { address, addressType, connectable, advertisement };
    return [uuid, options];
  }
}

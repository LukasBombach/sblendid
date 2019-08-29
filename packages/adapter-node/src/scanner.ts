import Bindings from "./bindings";
import { PeripheralData } from "./peripheral";
import { Listener, Params, AddressType, Advertisement } from "./types/bindings";

export type FindCondition = (peripheralData: PeripheralData) => boolean;

export default class Scanner {
  private bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public async find(condition: FindCondition): Promise<PeripheralData> {
    return await this.bindings.run<"discover", PeripheralData>(
      () => this.bindings.startScanning(),
      () => this.bindings.when("discover", this.getDiscoverListener(condition)),
      () => this.bindings.stopScanning(),
      params => this.getPeripheralData(...params)
    );
  }

  private getDiscoverListener(condition: FindCondition): Listener<"discover"> {
    return (...params: Params<"discover">) =>
      condition(this.getPeripheralData(...params));
  }

  private getPeripheralData(
    uuid: string,
    address: string,
    addressType: AddressType,
    connectable: boolean,
    advertisement: Advertisement,
    rssi: number
  ): PeripheralData {
    return {
      uuid,
      address,
      addressType,
      connectable,
      advertisement,
      rssi
    };
  }
}

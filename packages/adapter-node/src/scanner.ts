import Bindings from "./bindings";
import { PeripheralProps } from "./peripheral";
import { Listener, Params, AddressType, Advertisement } from "./types/bindings";

export type FindCondition = (peripheralProps: PeripheralProps) => boolean;

export default class Scanner {
  private bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public async find(condition: FindCondition): Promise<PeripheralProps> {
    return await this.bindings.run<"discover", PeripheralProps>(
      () => this.bindings.startScanning(),
      () => this.bindings.when("discover", this.getDiscoverListener(condition)),
      () => this.bindings.stopScanning(),
      params => this.getPeripheralProps(...params)
    );
  }

  private getDiscoverListener(condition: FindCondition): Listener<"discover"> {
    return (...params: Params<"discover">) =>
      condition(this.getPeripheralProps(...params));
  }

  private getPeripheralProps(
    uuid: string,
    address: string,
    addressType: AddressType,
    connectable: boolean,
    advertisement: Advertisement,
    rssi: number
  ): PeripheralProps {
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

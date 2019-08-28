import Adapter from "./adapter";
import Bindings from "./types/bindings";

export type AddressType = "public" | "random";

export interface Advertisement {
  localName?: string;
  txPowerLevel?: number;
  serviceUUIDs?: SUUID[];
  manufacturerData?: Buffer;
  serviceData?: Buffer;
}

export interface PeripheralProps {
  uuid: string;
  address: string;
  addressType?: AddressType;
  connectable?: boolean;
  advertisement: Advertisement;
  rssi: number;
}

export default class Peripheral {
  private adapter: Adapter;
  private bindings: Bindings;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
    this.bindings = adapter.bindings;
  }

  public async connect(peripheralUUID: PUUID): Promise<void> {
    await this.adapter.run(
      () => this.bindings.connect(peripheralUUID),
      () => this.adapter.when("connect", uuid => uuid === peripheralUUID)
    );
  }

  public async disconnect(peripheralUUID: PUUID): Promise<void> {
    await this.adapter.run(
      () => this.bindings.disconnect(peripheralUUID),
      () => this.adapter.when("disconnect", uuid => uuid === peripheralUUID)
    );
  }

  public async getServices(peripheralUUID: PUUID): Promise<SUUID[]> {
    return await this.adapter.run<"servicesDiscover", SUUID[]>(
      () => this.bindings.discoverServices(peripheralUUID, []),
      () =>
        this.adapter.when("servicesDiscover", uuid => uuid === peripheralUUID),
      ([, serviceUuids]) => serviceUuids
    );
  }

  public async getRssi(peripheralUUID: PUUID): Promise<number> {
    return await this.adapter.run<"rssiUpdate", number>(
      () => this.bindings.updateRssi(peripheralUUID),
      () => this.adapter.when("rssiUpdate", uuid => uuid === peripheralUUID),
      ([, rssi]) => rssi
    );
  }
}

import Bindings from "./bindings";

export type AddressType = "public" | "random" | "unknown";

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
  addressType: AddressType;
  connectable?: boolean;
  advertisement: Advertisement;
  rssi: number;
}

export default class Peripheral {
  private bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public async connect(pUUID: PUUID): Promise<void> {
    await this.bindings.run(
      () => this.bindings.connect(pUUID),
      () => this.bindings.when("connect", uuid => uuid === pUUID)
    );
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    await this.bindings.run(
      () => this.bindings.disconnect(pUUID),
      () => this.bindings.when("disconnect", uuid => uuid === pUUID)
    );
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    return await this.bindings.run<"servicesDiscover", SUUID[]>(
      () => this.bindings.discoverServices(pUUID, []),
      () => this.bindings.when("servicesDiscover", uuid => uuid === pUUID),
      ([, serviceUuids]) => serviceUuids
    );
  }

  public async getRssi(pUUID: PUUID): Promise<number> {
    return await this.bindings.run<"rssiUpdate", number>(
      () => this.bindings.updateRssi(pUUID),
      () => this.bindings.when("rssiUpdate", uuid => uuid === pUUID),
      ([, rssi]) => rssi
    );
  }
}

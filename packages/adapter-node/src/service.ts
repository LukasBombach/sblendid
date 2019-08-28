import Adapter from "./adapter";
import { CharacteristicData } from "./characteristic";
import Bindings, { NobleCharacteristic } from "./types/bindings";

export default class Service {
  private adapter: Adapter;
  private bindings: Bindings;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
    this.bindings = adapter.bindings;
  }

  public async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<CharacteristicData[]> {
    const isThis = this.isThis(pUUID, sUUID);
    return await this.adapter.run<
      "characteristicsDiscover",
      CharacteristicData[]
    >(
      () => this.bindings.discoverCharacteristics(pUUID, sUUID, []),
      () => this.adapter.when("characteristicsDiscover", isThis),
      ([, , characteristics]) => this.getCharacteristicData(characteristics)
    );
  }

  private getCharacteristicData(
    nobleCharacteristics: NobleCharacteristic[]
  ): CharacteristicData[] {
    return nobleCharacteristics.map(({ uuid, properties }) => {
      propertiess;
      return { uuid };
    });
  }

  private isThis(...originalValues: any[]): (...values: any[]) => boolean {
    return (...values: any[]) =>
      originalValues.every((v, i) => v === values[i]);
  }
}

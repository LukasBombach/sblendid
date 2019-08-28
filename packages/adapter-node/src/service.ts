import Bindings from "./bindings";
import { CharacteristicData } from "./characteristic";
import { NobleCharacteristic } from "./types/bindings";

export default class Service {
  private bindings: Bindings;

  constructor(bindings: Bindings) {
    this.bindings = bindings;
  }

  public async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<CharacteristicData[]> {
    const isThis = this.isThis(pUUID, sUUID);
    return await this.bindings.run<
      "characteristicsDiscover",
      CharacteristicData[]
    >(
      () => this.bindings.discoverCharacteristics(pUUID, sUUID, []),
      () => this.bindings.when("characteristicsDiscover", isThis),
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

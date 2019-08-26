import Adapter from "./adapter";
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
  ): Promise<NobleCharacteristic[]> {
    const isThis = this.isThis(pUUID, sUUID);
    return await this.adapter.run<
      "characteristicsDiscover",
      NobleCharacteristic[]
    >(
      () => this.bindings.discoverCharacteristics(pUUID, sUUID, []),
      () => this.adapter.when("characteristicsDiscover", isThis),
      ([, , characteristics]) => characteristics
    );
  }

  private isThis(...originalValues: any[]): (...values: any[]) => boolean {
    return (...values: any[]) =>
      originalValues.every((v, i) => v === values[i]);
  }
}

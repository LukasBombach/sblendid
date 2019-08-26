import Adapter from "./adapter";
import Bindings from "./types/bindings";

export default class Peripheral {
  private adapter: Adapter;
  private bindings: Bindings;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
    this.bindings = adapter.bindings;
  }

  public async connect(uuid: PUUID): Promise<void> {
    await this.adapter.run(
      () => this.bindings.connect(uuid),
      () => this.adapter.when("connect", uuid2 => uuid2 === uuid)
    );
  }

  public async disconnect(uuid: PUUID): Promise<void> {
    await this.adapter.run(
      () => this.bindings.disconnect(uuid),
      () => this.adapter.when("disconnect", uuid2 => uuid2 === uuid)
    );
  }

  public async getServices(uuid: PUUID): Promise<SUUID[]> {
    return await this.adapter.run<"servicesDiscover", SUUID[]>(
      () => this.bindings.discoverServices(uuid, []),
      () => this.adapter.when("servicesDiscover", uuid2 => uuid2 === uuid),
      ([, serviceUuids]) => serviceUuids
    );
  }

  public async getRssi(uuid: PUUID): Promise<number> {
    return await this.adapter.run<"rssiUpdate", number>(
      () => this.bindings.updateRssi(uuid),
      () => this.adapter.when("rssiUpdate", uuid2 => uuid2 === uuid),
      ([, rssi]) => rssi
    );
  }
}

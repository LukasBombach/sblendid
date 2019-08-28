import Adapter from "./adapter";
import Bindings from "./types/bindings";

export interface Properties {
  readonly read?: boolean;
  readonly write?: boolean;
  readonly notify?: boolean;
}

export interface CharacteristicData {
  uuid: CUUID;
  properties: Properties;
}

export default class Characteristic {
  private adapter: Adapter;
  private bindings: Bindings;

  constructor(adapter: Adapter) {
    this.adapter = adapter;
    this.bindings = adapter.bindings;
  }

  public async read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    const isThis = this.isThis(pUUID, sUUID, cUUID);
    return await this.adapter.run<"read", Buffer>(
      () => this.bindings.read(pUUID, sUUID, cUUID),
      () => this.adapter.when("read", isThis),
      ([, , , buffer]) => buffer
    );
  }

  public async write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse = false
  ): Promise<void> {
    const isThis = this.isThis(pUUID, sUUID, cUUID);
    await this.adapter.run<"write">(
      () => this.bindings.write(pUUID, sUUID, cUUID, value, withoutResponse),
      () => this.adapter.when("write", isThis)
    );
  }

  public async notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    const isThis = this.isThis(pUUID, sUUID, cUUID);
    return await this.adapter.run<"notify", boolean>(
      () => this.bindings.notify(pUUID, sUUID, cUUID, notify),
      () => this.adapter.when("notify", isThis),
      ([, , , state]) => state
    );
  }

  private isThis(...originalValues: any[]): (...values: any[]) => boolean {
    return (...values: any[]) =>
      originalValues.every((v, i) => v === values[i]);
  }
}

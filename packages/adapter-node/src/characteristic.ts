import Bindings from "./bindings";

export interface Properties {
  read: boolean;
  write: boolean;
  notify: boolean;
}

export interface CharacteristicData {
  uuid: CUUID;
  properties: Properties;
}

export default class Characteristic {
  private bindings = Bindings.getInstance();

  public async read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    const isThis = this.isThis(pUUID, sUUID, cUUID);
    return await this.bindings.run<"read", Buffer>(
      () => this.bindings.read(pUUID, sUUID, cUUID),
      () => this.bindings.when("read", isThis),
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
    await this.bindings.run<"write">(
      () => this.bindings.write(pUUID, sUUID, cUUID, value, withoutResponse),
      () => this.bindings.when("write", isThis)
    );
  }

  public async notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    const isThis = this.isThis(pUUID, sUUID, cUUID);
    return await this.bindings.run<"notify", boolean>(
      () => this.bindings.notify(pUUID, sUUID, cUUID, notify),
      () => this.bindings.when("notify", isThis),
      ([, , , state]) => state
    );
  }

  private isThis(...originalValues: any[]): (...values: any[]) => boolean {
    return (...values: any[]) =>
      originalValues.every((v, i) => v === values[i]);
  }
}

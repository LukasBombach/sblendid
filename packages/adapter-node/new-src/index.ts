/// <reference path="./types/global.d.ts" />

export type FindCondition = (
  ...discoverParams: Params<"discover">
) => Promish<boolean>;

export default abstract class Sblendiddapter {
  public abstract init(): Promise<void>;

  public abstract startScanning(): Promise<void>;

  public abstract stopScanning(): Promise<void>;

  public abstract find(condition: FindCondition): Promise<Params<"discover">>;

  public abstract connect(pUUID: PUUID): Promise<void>;

  public abstract disconnect(pUUID: PUUID): Promise<void>;

  public abstract getServices(pUUID: PUUID): Promise<SUUID[]>;

  public abstract getRssi(pUUID: PUUID): Promise<number>;

  public abstract on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void>;

  public abstract off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void>;

  public abstract getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]>;

  public abstract read(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID
  ): Promise<Buffer>;

  public abstract write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse = false
  ): Promise<void>;

  public abstract notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean>;
}

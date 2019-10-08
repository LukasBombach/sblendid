import Adapter, { FindCondition, Characteristic } from "./adapter";
import { Event, Params, Listener } from "./types/nobleAdapter";

export default class WinRTAdapter extends Adapter {
  public init(): Promise<void> {}

  public startScanning(): Promise<void> {}

  public stopScanning(): Promise<void> {}

  public find(condition: FindCondition): Promise<Params<"discover">> {}

  public connect(pUUID: PUUID): Promise<void> {}

  public disconnect(pUUID: PUUID): Promise<void> {}

  public getRssi(pUUID: PUUID): Promise<number> {}

  public getServices(pUUID: PUUID): Promise<SUUID[]> {}

  public getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {}

  public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {}

  public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {}

  public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {}

  public on<E extends Event>(event: E, listener: Listener<E>): Promise<void> {}

  public off<E extends Event>(event: E, listener: Listener<E>): Promise<void> {}
}

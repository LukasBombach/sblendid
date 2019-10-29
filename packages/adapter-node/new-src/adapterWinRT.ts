import Adapter, { FindCondition, Characteristic } from "./adapter";
import { Event, Params, Listener } from "./types/nobleAdapter";

export default class WinRTAdapter extends Adapter {
  public init(): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public startScanning(): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public stopScanning(): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public find(condition: FindCondition): Promise<Params<"discover">> {
    throw new Error("Not implemented yet");
  }

  public connect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public disconnect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet");
  }

  public getServices(pUUID: PUUID): Promise<SUUID[]> {
    throw new Error("Not implemented yet");
  }

  public getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    throw new Error("Not implemented yet");
  }

  public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    throw new Error("Not implemented yet");
  }

  public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    throw new Error("Not implemented yet");
  }

  public on<E extends Event>(event: E, listener: Listener<E>): Promise<void> {
    throw new Error("Not implemented yet");
  }

  public off<E extends Event>(event: E, listener: Listener<E>): Promise<void> {
    throw new Error("Not implemented yet");
  }
}

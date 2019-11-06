import { CUUID } from "./ble";
import { Params } from "../types/noble";

export type FindCondition = (
  ...params: Params<"discover">
) => Promise<boolean> | boolean;

export interface Characteristic {
  uuid: CUUID;
  properties: {
    read: boolean;
    write: boolean;
    notify: boolean;
  };
}

export default interface SblendidAdapter {
  init(): Promise<void>;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  find(condition: FindCondition): Promise<Params<"discover">>;
  connect(pUUID: PUUID): Promise<void>;
  disconnect(pUUID: PUUID): Promise<void>;
  getRssi(pUUID: PUUID): Promise<number>;
  getServices(pUUID: PUUID): Promise<SUUID[]>;
  getCharacteristics(pUUID: PUUID, sUUID: SUUID): Promise<Characteristic[]>;
  read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer>;
  write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void>;
  notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean>;
}

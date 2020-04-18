import type { PUUID, SUUID, CUUID } from "./ble";

export type AddressType = "public" | "random";

export interface PeripheralJSON {
  uuid: string;
  address: string;
  addressType: AddressType;
  rssi: number;
  txPowerLevel: number;
  blocked: boolean;
  name?: string;
  serviceUuids?: SUUID[];
  manufacturerData?: Buffer;
}

export interface CharacteristicJSON {
  uuid: CUUID;
  read: boolean;
  write: boolean;
  notify: boolean;
}

export type FindCondition = (
  peripheral: PeripheralJSON
) => Promise<boolean> | boolean;

export interface Adapter {
  init(): Promise<void>;
  startScanning(): Promise<void>;
  stopScanning(): Promise<void>;
  find(condition: FindCondition): Promise<PeripheralJSON>;
  connect(pUUID: PUUID): Promise<void>;
  disconnect(pUUID: PUUID): Promise<void>;
  getRssi(pUUID: PUUID): Promise<number>;
  getServices(pUUID: PUUID): Promise<SUUID[]>;
  getCharacteristics(pUUID: PUUID, sUUID: SUUID): Promise<CharacteristicJSON[]>;
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

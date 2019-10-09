import path from "path";
import { EventEmitter } from "events";
import { inherits } from "util";
import Adapter, { FindCondition, Characteristic } from "./adapter";
import { Event, Params, Listener } from "./types/nobleAdapter";

import NobleBindings from "../src/types/bindings";
const nativePath = path.resolve(__dirname, "../native/noble_mac.node");
const NobleMac = require(nativePath).NobleMac;
inherits(NobleMac, EventEmitter);

type SubType<Base, Condition> = {
  [Key in keyof Base]: Base[Key] extends Condition ? Key : never;
}[keyof Base];

type NobleMethod = SubType<NobleBindings, Function>;

export default class MacOSAdapter extends Adapter {
  private nobleMac: NobleBindings = new NobleMac();

  public async init(): Promise<void> {
    await this.run("init", [], ["poweredOn"]);
  }

  public async startScanning(): Promise<void> {
    this.nobleMac.startScanning();
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

  private async run<M extends NobleMethod>(
    method: M,
    params: Parameters<NobleBindings[M]>,
    condition: any[]
  ): Promise<void> {}
}

import Adapter, { CharacteristicData } from "@sblendid/adapter-node";
import Peripheral from "./peripheral";
import Characteristic, { Converter } from "./characteristic";

export type Value<C, N extends keyof C> = C[N] extends Converter<infer R>
  ? R
  : never;
export type Listener<C, N extends keyof C> = (
  value: Value<C, N>
) => Promise<void> | void;

export default class Service<C extends Converter<any>[]> {
  public adapter: Adapter;
  public peripheral: Peripheral;
  public uuid: SUUID;
  private converters?: C;
  private characteristics?: Record<string, Characteristic>;

  constructor(peripheral: Peripheral, uuid: SUUID, converters?: C) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.converters = this.validateConverters(converters);
    this.uuid = uuid;
  }

  public async read(name: keyof C): Promise<any> {
    const characteristic = await this.getCharacteristic(name);
    return await characteristic.read();
  }

  public async write<N extends keyof C>(
    name: N,
    value: Value<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.write(value);
  }

  public async on<N extends keyof C>(
    name: N,
    listener: Listener<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.on("notify", listener);
  }

  public async off<N extends keyof C>(
    name: N,
    listener: Listener<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.off("notify", listener);
  }

  public async getCharacteristics(): Promise<Record<string, Characteristic>> {
    if (this.characteristics) return this.characteristics;
    const [puuid, uuid] = this.getIds();
    const nobles = await this.adapter.getCharacteristics(puuid, uuid);
    const characteristics = nobles.map(data => this.getCFromN(data));
    this.characteristics = this.uuidMap<Characteristic>(characteristics);
    return this.characteristics;
  }

  private async getCharacteristic<N extends keyof C>(
    name: N
  ): Promise<Characteristic<Value<C, N>>> {
    const characteristics = await this.getCharacteristics();
    const converter = this.getConverter(name);
    if (!converter) throw new Error(`Cannot find converter for ${name}`);
    const characteristic = characteristics[converter.uuid];
    if (!characteristic)
      throw new Error(`Cannot find characteristic for ${name}`);
    return characteristic as any;
  }

  private validateConverters(converters?: C): C | undefined {
    if (typeof converters === "undefined") return undefined;
    const uuids = Object.values(converters).map(c => c.uuid);
    const hasDuplicates = new Set(uuids).size !== uuids.length;
    if (hasDuplicates) throw new Error("Duplicate UUIDs"); // todo better error message
    return converters;
  }

  private getIds(): [string, SUUID] {
    return [this.peripheral.uuid, this.uuid];
  }

  private getConverter<N extends keyof C>(
    name: N
  ): Converter<Value<C, N>> | undefined {
    if (!this.converters) return;
    if (this.converters[name]) return this.converters[name] as any;
    return Object.values(this.converters).find(
      c => c.uuid === (name as string)
    );
  }

  private uuidMap<T extends { uuid: CUUID }>(arr: T[]): Record<string, T> {
    return arr.reduce((o, c) => ({ ...o, [c.uuid]: c }), {});
  }

  private getCFromN(data: CharacteristicData): Characteristic {
    const { uuid, properties } = data;
    const converter = this.getConverter(uuid as any) as any;
    return new Characteristic(this, uuid, converter, properties);
  }
}

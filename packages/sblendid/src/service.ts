import Adapter, { CharacteristicData } from "@sblendid/adapter-node";
import Characteristic, { Converter, Value } from "./characteristic";
import Peripheral from "./peripheral";

/* 
export type ContererX<
  C extends Converters,
  N extends keyof C
> = C[N] extends Converter<any> ? C : undefined;


export type Values<C, N extends Name<C>> = C extends Converters
  ? ConvertersValue<C, N>
  : Buffer;

export type Listener<C, N extends Name<C>> = (
  value: Value<C, N>
) => Promish<void>;

type ConvertersValue<
  C extends Converters,
  N extends Name<C>
> = C[N] extends Converter<infer V> ? V : never;

// type ConvertersConverter<C extends Converters, N extends keyof C> = Pick<C, N>;

export type Value<C, N extends Name<C>> = C extends Converters
  ? N extends keyof C
    ? C[N] extends Converter<infer V>
      ? V
      : never
    : never
  : Buffer;

type ConvertersValue<
  C extends Converters,
  N extends Name<C>
> = C[N] extends Converter<infer V> ? V : never;
*/

export type Converters = Record<string, Converter<any>>;
export type Name<C> = C extends Converters ? keyof C : CUUID;

export default class Service<C extends Converters | undefined = undefined> {
  public uuid: SUUID;
  public adapter: Adapter;
  public peripheral: Peripheral;
  private converters?: Converters;
  private characteristics?: Characteristic<any>[];

  constructor(peripheral: Peripheral, uuid: SUUID, converters?: C) {
    this.uuid = uuid;
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.converters = converters;
  }

  public async read<N extends Name<C>>(name: N): Promise<Value<C, N>> {
    const characteristic = await this.getCharacteristic(name);
    return await characteristic.read();
  }

  public async write<N extends Name<C>>(
    name: N,
    value: Value<C, N>,
    withoutResponse?: boolean
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.write(value, withoutResponse);
  }

  public async on<N extends Name<C>>(
    name: N,
    listener: Listener<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.on("notify", listener);
  }

  public async off<N extends Name<C>>(
    name: N,
    listener: Listener<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.off("notify", listener);
  }

  public async getCharacteristic<N extends Name<C>>(
    name: N
  ): Promise<Characteristic<>> {
    const uuid = this.getCUUID(name);
    const characteristics = await this.getCharacteristics();
    const characteristic = characteristics.find(c => c.uuid === uuid);
    const errorMessage = `Cannot find Characteristic for "${name}"`;
    if (!characteristic) throw new Error(errorMessage);
    return characteristic;
  }

  public async getCharacteristics(): Promise<Characteristic<any>[]> {
    if (this.characteristics) return this.characteristics;
    const { adapter, uuid: puuid } = this.peripheral;
    const data = await adapter.getCharacteristics(puuid, this.uuid);
    this.characteristics = data.map(data =>
      this.getCharactersticFromData(data)
    );
    return this.characteristics;
  }

  private getCharactersticFromData(data: CharacteristicData): Characteristic {
    const { uuid, properties } = data;
    const converters = this.converters || {};
    const converter = Object.values(converters).find(c => c.uuid === uuid);
    return new Characteristic(this, uuid, properties, converter);
  }

  private getConverter<N extends Name<C>>(
    uuid: CUUID
  ): N extends keyof C ? C[N] : undefined {
    const converters = this.converters || {};
    return Object.values(converters).find(c => c.uuid === uuid);
  }

  private getCUUID(name: Name<C>): CUUID {
    if (typeof name === "number") return name;
    if (!this.converters) return name as CUUID;
    const converter = this.converters[name as string];
    return converter ? converter.uuid : (name as CUUID);
  }
}

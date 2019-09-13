import { CharacteristicData } from "@sblendid/adapter-node";
import Characteristic, { Converter, Value } from "./characteristic";
import Peripheral from "./peripheral";

export type Converters = Record<string, Converter<any>>;
export type MaybeConverters = Converters | undefined;

export type Names<C extends MaybeConverters> = C extends Converters
  ? keyof C
  : CUUID;

export type PickConverter<
  C extends MaybeConverters,
  N extends Names<C>
> = C extends Converters ? (N extends keyof C ? C[N] : undefined) : undefined;

export type PickValue<C extends MaybeConverters, N extends Names<C>> = Value<
  PickConverter<C, N>
>;

export type Listener<C extends MaybeConverters, N extends Names<C>> = (
  value: PickValue<C, N>
) => Promish<void>;

export default class Service<C extends MaybeConverters = undefined> {
  public uuid: SUUID;
  public peripheral: Peripheral;
  private converters?: Converters;
  private characteristics?: Characteristic<any>[];

  constructor(peripheral: Peripheral, uuid: SUUID, converters?: C) {
    this.uuid = uuid;
    this.peripheral = peripheral;
    this.converters = converters;
  }

  public async read<N extends Names<C>>(name: N): Promise<PickValue<C, N>> {
    const characteristic = await this.getCharacteristic(name);
    return await characteristic.read();
  }

  public async write<N extends Names<C>>(
    name: N,
    value: PickValue<C, N>,
    withoutResponse?: boolean
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.write(value, withoutResponse);
  }

  public async on<N extends Names<C>>(
    name: N,
    listener: Listener<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.on("notify", listener);
  }

  public async off<N extends Names<C>>(
    name: N,
    listener: Listener<C, N>
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.off("notify", listener);
  }

  public async getCharacteristic<N extends Names<C>>(
    name: N
  ): Promise<Characteristic<PickConverter<C, N>>> {
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

  private getCUUID(name: Names<C>): CUUID {
    if (typeof name === "number") return name;
    if (!this.converters) return name as CUUID;
    const converter = this.converters[name as string];
    return converter ? converter.uuid : (name as CUUID);
  }
}

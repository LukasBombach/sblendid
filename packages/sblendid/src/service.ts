import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic, { Converter } from "./characteristic";
import { NobleCharacteristic as NBC } from "./bindings";

// export default class Service<C extends Converters<keyof C>> {
export default class Service<C> {
  public adapter: Adapter;
  public peripheral: Peripheral;
  public uuid: SUUID;
  private converters?: C;
  private characteristics?: Record<string, Characteristic>;

  constructor(peripheral: Peripheral, uuid: SUUID, converters?: C) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.converters = converters;
    this.uuid = uuid;
  }

  public async read(name: keyof C): Promise<any> {
    const characteristic = await this.getCharacteristic(name);
    return await characteristic.read();
  }

  public async write<K extends keyof C>(
    name: K,
    value: C[K] extends Converter<infer R> ? R : never
  ): Promise<void> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.write(value);
  }

  public async on<N extends keyof C>(
    name: N,
    listener: (
      value: C[N] extends Converter<infer R> ? R : never
    ) => Promise<void> | void
  ) {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.on("notify", listener);
  }

  public async off<N extends keyof C>(
    name: N,
    listener: (
      value: C[N] extends Converter<infer R> ? R : never
    ) => Promise<void> | void
  ) {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.off("notify", listener);
  }

  private async getCharacteristic<N extends keyof C>(
    name: N
  ): Promise<Characteristic<C[N] extends Converter<infer R> ? R : never>> {
    const characteristics = await this.getCharacteristics();
    const converter = this.getConverter(name);
    if (!converter) throw new Error(`Cannot find converter`);
    const characteristic = characteristics[converter.uuid];
    if (!characteristic) throw new Error(`Cannot find characteristic`);
    return characteristic as any;
  }

  public async getCharacteristics(): Promise<Record<string, Characteristic>> {
    if (this.characteristics) return this.characteristics;
    const nobles = await this.fetchCharacteristics();
    const characteristics = nobles.map(nbc => this.getCFromN(nbc));
    this.characteristics = this.uuidMap<Characteristic>(characteristics);
    return this.characteristics;
  }

  private getIds(): [string, SUUID] {
    return [this.peripheral.uuid, this.uuid];
  }

  private isThis(puuid: string, suuid: SUUID): boolean {
    return puuid === this.peripheral.uuid && suuid === this.uuid;
  }

  private getConverter(name: string): Converter<any> | undefined {
    if (!this.converters) return;
    return this.converters[name]; // todo <- this breaks loading a characteristic by uuid
  }

  private uuidMap<T extends { uuid: CUUID }>(arr: T[]): Record<string, T> {
    return arr.reduce((o, c) => ({ ...o, [c.uuid]: c }), {});
  }

  private getCFromN(nbc: NBC): Characteristic {
    return Characteristic.fromNoble(this, nbc, this.getConverter(nbc.uuid));
  }

  private async fetchCharacteristics(): Promise<NBC[]> {
    const [puuid, uuid] = this.getIds();
    const isThis = (p: string, s: SUUID) => this.isThis(p, s);
    return await this.adapter.run<"characteristicsDiscover", NBC[]>(
      () => this.adapter.discoverCharacteristics(puuid, uuid, []),
      () => this.adapter.when("characteristicsDiscover", isThis),
      ([, , characteristics]) => characteristics
    );
  }
}

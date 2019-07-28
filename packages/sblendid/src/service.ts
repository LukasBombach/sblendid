import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic from "./characteristic";
import { NobleCharacteristic as NBC } from "sblendid-bindings-macos";

export default class Service {
  public adapter: Adapter;
  public peripheral: Peripheral;
  public uuid: SUUID;
  private converters: Converter<any>[];
  private characteristics?: Record<string, Characteristic>;

  constructor(
    peripheral: Peripheral,
    uuid: SUUID,
    converters: Converter<any>[] = []
  ) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.converters = converters;
    this.uuid = uuid;
  }

  public async read(name: NamedCUUID): Promise<any> {
    const characteristic = await this.getCharacteristic(name);
    return await characteristic.read();
  }

  public async write(name: NamedCUUID, value: any): Promise<any> {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.write(value);
  }

  public async on(name: NamedCUUID, listener: (value: any) => void) {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.on("notify", listener);
  }

  public async off(name: NamedCUUID, listener: (value: any) => void) {
    const characteristic = await this.getCharacteristic(name);
    await characteristic.off("notify", listener);
  }

  private async getCharacteristic(name: NamedCUUID): Promise<Characteristic> {
    const characteristics = await this.getCharacteristics();
    const converter = this.getConverter(name);
    const characteristic = characteristics[converter ? converter.uuid : name];
    if (!characteristic) throw new Error(`Cannot find characteristic`);
    return characteristic;
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

  private getConverter(name: NamedCUUID): Converter<any> | undefined {
    return this.converters.find(c => [c.name, c.uuid].includes(name));
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

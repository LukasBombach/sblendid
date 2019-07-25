import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic from "./characteristic";
import { NobleCharacteristic } from "sblendid-bindings-macos";

type ConverterMap = Record<string, CharacteristicConverter>;

export default class Service {
  public readonly adapter: Adapter;
  public readonly peripheral: Peripheral;
  public readonly uuid: SUUID;
  public readonly name?: string;
  public readonly type?: string;
  private converters: CharacteristicConverter[];
  private characteristics?: NobleCharacteristic[];

  constructor(peripheral: Peripheral, uuid: SUUID, converters: CharacteristicConverter[] = []) {
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
    characteristic.on("notify", listener);
  }

  public async off(name: NamedCUUID, listener: (value: any) => void) {
    const characteristic = await this.getCharacteristic(name);
    characteristic.off("notify", listener);
  }

  public async getCharacteristics(
    converters: CharacteristicConverter[]
  ): Promise<Characteristic[]> {
    if (!this.characteristics) this.characteristics = await this.fetchCharacteristics();
    const converterMap = converters.reduce<ConverterMap>((o, c) => ({ ...o, [c.uuid]: c }), {});
    return this.characteristics.map(c => Characteristic.fromNoble(this, c, converterMap[c.uuid]));
  }

  private async getCharacteristic(name: NamedCUUID): Promise<Characteristic> {
    const converter = this.getConverter(name);
    const characteristics = await this.getCharacteristics([converter]);
    const characteristic = characteristics.find(c => c.uuid === converter.uuid);
    const error = new Error(`Cannot find characteristic with the uuid "${converter.uuid}"`);
    if (!characteristic) throw error;
    return characteristic;
  }

  private isThisService(peripheralUuid: string, serviceUuid: SUUID): boolean {
    return peripheralUuid === this.peripheral.uuid && serviceUuid === this.uuid;
  }

  private getConverter(nameOrUuid: NamedCUUID): CharacteristicConverter {
    return this.converters.find(c => c.name === nameOrUuid) || { uuid: nameOrUuid };
  }

  private async fetchCharacteristics(): Promise<NobleCharacteristic[]> {
    return await this.adapter.run<"characteristicsDiscover">(
      () => this.adapter.discoverCharacteristics(this.peripheral.uuid, this.uuid, []),
      () => this.adapter.when("characteristicsDiscover", ([p, s]) => this.isThisService(p, s)),
      ([, , characteristics]) => characteristics
    );
  }
}

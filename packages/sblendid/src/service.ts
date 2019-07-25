import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic from "./characteristic";

export default class Service {
  public readonly adapter: Adapter;
  public readonly peripheral: Peripheral;
  public readonly uuid: SUUID;
  public readonly name?: string;
  public readonly type?: string;
  private converters: CharacteristicConverter[];
  private characteristicsUuids?: CUUID[];

  constructor(peripheral: Peripheral, uuid: SUUID, converters: CharacteristicConverter[] = []) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.uuid = uuid;
    this.converters = converters;
  }

  public async read(nameOrUuid: CUUID | string): Promise<any> {
    const { uuid, decode } = this.getConverter(nameOrUuid);
    const characteristic = await this.getCharacteristic(uuid);
    const buffer = await characteristic.read();
    return decode ? await decode(buffer) : buffer;
  }

  public async getCharacteristic(uuid: CUUID): Promise<Characteristic> {
    const characteristics = await this.getCharacteristics();
    const characteristic = characteristics.find(c => c.uuid === uuid);
    if (!characteristic) throw new Error(`Cannot find characteristic with the uuid "${uuid}"`);
    return characteristic;
  }

  public async getCharacteristics(): Promise<Characteristic[]> {
    if (!this.characteristicsUuids) this.characteristicsUuids = await this.fetchCharacteristics();
    return this.characteristicsUuids.map(uuid => new Characteristic(this, uuid));
  }

  private async fetchCharacteristics(): Promise<CUUID[]> {
    return await this.adapter.run<"characteristicsDiscover">(
      () => this.adapter.discoverCharacteristics(this.peripheral.uuid, this.uuid, []),
      () => this.adapter.when("characteristicsDiscover", ([p, s]) => this.isThisService(p, s)),
      ([, , characteristics]) => characteristics.map(({ uuid }) => uuid)
    );
  }

  private isThisService(peripheralUuid: string, serviceUuid: SUUID): boolean {
    return peripheralUuid === this.peripheral.uuid && serviceUuid === this.uuid;
  }

  private getConverter(nameOrUuid: CUUID | string): CharacteristicConverter {
    return this.converters.find(c => c.name === nameOrUuid) || { uuid: nameOrUuid };
  }
}

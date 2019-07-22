import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic, { CharacteristicConverter } from "./characteristic";

export default class Service {
  public readonly adapter: Adapter;
  public readonly peripheral: Peripheral;
  public readonly uuid: BluetoothServiceUUID;
  public readonly name?: string;
  public readonly type?: string;
  private converters: CharacteristicConverter[];
  private characteristics?: Characteristic[];

  constructor(
    peripheral: Peripheral,
    uuid: BluetoothServiceUUID,
    converters: CharacteristicConverter[] = []
  ) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.uuid = uuid;
    this.converters = converters;
  }

  // todo types
  public async read(name: BluetoothCharacteristicUUID | string): Promise<any> {
    const converter = this.converters.find(c => c.name === name);
    const uuid = converter ? converter.uuid : name;
    const buffer = await new Characteristic(this, uuid).read();
    return converter && converter.decode ? await converter.decode(buffer) : buffer;
  }

  public async getCharacteristics(): Promise<Characteristic[]> {
    if (!this.characteristics) this.characteristics = await this.fetchCharacteristics();
    return this.characteristics;
  }

  private async fetchCharacteristics(): Promise<Characteristic[]> {
    const [, , characteristics] = await this.adapter.run<"characteristicsDiscover">(
      () => this.adapter.discoverCharacteristics(this.peripheral.uuid, this.uuid, []),
      () => this.adapter.when("characteristicsDiscover", ([p, s]) => this.isThisService(p, s))
    );
    return characteristics.map(({ uuid }) => new Characteristic(this, uuid));
  }

  private isThisService(peripheralUuid: string, serviceUuid: BluetoothServiceUUID): boolean {
    return peripheralUuid === this.peripheral.uuid && serviceUuid === this.uuid;
  }
}

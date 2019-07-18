import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic from "./characteristic";

export default class Service {
  public readonly adapter: Adapter;
  public readonly peripheral: Peripheral;
  public readonly uuid: BluetoothServiceUUID;
  public readonly name?: string;
  public readonly type?: string;
  private characteristics?: Characteristic[];

  constructor(peripheral: Peripheral, uuid: BluetoothServiceUUID, name?: string, type?: string) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.uuid = uuid;
    this.name = name;
    this.type = type;
  }

  public async init(): Promise<this> {
    this.characteristics = await this.fetchCharacteristics();
    return this;
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
    return characteristics.map(characteristic => new Characteristic(characteristic));
  }

  private isThisService(peripheralUuid: string, serviceUuid: BluetoothServiceUUID): boolean {
    return peripheralUuid === this.peripheral.uuid && serviceUuid === this.uuid;
  }
}
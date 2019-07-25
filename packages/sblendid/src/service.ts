import { EventEmitter } from "events";
import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic from "./characteristic";
import { NobleCharacteristic } from "sblendid-bindings-macos";

export default class Service {
  public readonly adapter: Adapter;
  public readonly peripheral: Peripheral;
  public readonly uuid: SUUID;
  public readonly name?: string;
  public readonly type?: string;
  private converters: CharacteristicConverter[];
  private eventEmitter: EventEmitter;
  private characteristics?: NobleCharacteristic[];

  constructor(peripheral: Peripheral, uuid: SUUID, converters: CharacteristicConverter[] = []) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.uuid = uuid;
    this.converters = converters;
    this.eventEmitter = new EventEmitter();
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
    const { uuid, decode } = this.getConverter(name);
    const characteristic = await this.getCharacteristic(uuid);
    characteristic.on("notify");
  }

  public off(name: NamedCUUID, listener: (value: any) => void) {
    this.eventEmitter.off(name.toString(), listener);
    if (this.eventEmitter.listenerCount(name.toString()) === 0) this.notify(name, false);
  }

  /* public on(name: NamedCUUID, listener: (value: any) => void) {
    if (this.eventEmitter.listenerCount(name.toString()) === 0) this.notify(name, true);
    this.eventEmitter.on(name.toString(), listener);
  }

  public off(name: NamedCUUID, listener: (value: any) => void) {
    this.eventEmitter.off(name.toString(), listener);
    if (this.eventEmitter.listenerCount(name.toString()) === 0) this.notify(name, false);
  } */

  public async getCharacteristics(
    converters: CharacteristicConverter[]
  ): Promise<Characteristic[]> {
    if (!this.characteristics) this.characteristics = await this.fetchCharacteristics();
    return this.characteristics.map(c => Characteristic.fromNoble(this, c));
  }

  private async notify(name: NamedCUUID, notify: boolean): Promise<void> {
    const { uuid, decode } = this.getConverter(name);
    const characteristic = await this.getCharacteristic(uuid);
  }

  private async getCharacteristic(name: NamedCUUID): Promise<Characteristic> {
    const characteristics = await this.getCharacteristics([converter]);
    const characteristic = characteristics.find(c => c.uuid === converter.uuid);
    if (!characteristic) throw new Error(`Cannot find characteristic with the uuid "${uuid}"`);
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

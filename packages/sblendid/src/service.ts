import Adapter from "./adapter";
import Peripheral from "./peripheral";
import Characteristic from "./characteristic";
import { NobleCharacteristic } from "sblendid-bindings-macos";

type CharacteristicMap = Record<string, Characteristic>;

export default class Service {
  public adapter: Adapter;
  public peripheral: Peripheral;
  public uuid: SUUID;
  public name?: string;
  public type?: string;
  private converters: Record<string, Converter>;
  private characteristics?: CharacteristicMap;

  constructor(
    peripheral: Peripheral,
    uuid: SUUID,
    converters: Converter<any>[] = []
  ) {
    this.peripheral = peripheral;
    this.adapter = peripheral.adapter;
    this.converters = this.uuidMap<Converter>(converters);
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

  private async getCharacteristic(name: NamedCUUID): Promise<Characteristic> {
    const characteristics = await this.getCharacteristics();
    const characteristic = characteristics[this.getConverter(name).uuid];
    if (!characteristic) throw new Error(`Cannot find characteristic`);
    return characteristic;
  }

  public async getCharacteristics(): Promise<CharacteristicMap> {
    if (this.characteristics) return this.characteristics;
    const nobles = await this.fetchCharacteristics();
    const characteristics = nobles.map(c =>
      Characteristic.fromNoble(this, c, this.converters[c.uuid])
    );
    this.characteristics = this.uuidMap<Characteristic>(characteristics);
    return this.characteristics;
  }

  private async fetchCharacteristics(): Promise<NobleCharacteristic[]> {
    return await this.adapter.run<
      "characteristicsDiscover",
      NobleCharacteristic[]
    >(
      () =>
        this.adapter.discoverCharacteristics(
          this.peripheral.uuid,
          this.uuid,
          []
        ),
      () =>
        this.adapter.when("characteristicsDiscover", ([p, s]) =>
          this.isThisService(p, s)
        ),
      ([, , characteristics]) => characteristics
    );
  }

  private isThisService(peripheralUuid: string, serviceUuid: SUUID): boolean {
    return peripheralUuid === this.peripheral.uuid && serviceUuid === this.uuid;
  }

  private getConverter(nameOrUuid: NamedCUUID): Converter {
    return (
      this.converters.find(c => c.name === nameOrUuid) || { uuid: nameOrUuid }
    );
  }

  private uuidMap<ElementTypes extends { uuid: CUUID }>(
    arr: ElementTypes[]
  ): Record<string, ElementTypes> {
    return arr.reduce((o, c) => ({ ...o, [c.uuid]: c }), {});
  }
}

import { NobleCharacteristic, NobleCharacteristicProperty } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";

export interface Properties {
  broadcast: boolean;
  read: boolean;
  writeWithoutResponse: boolean;
  write: boolean;
  notify: boolean;
  indicate: boolean;
  authenticatedSignedWrites: boolean;
  reliableWrite: boolean;
  writableAuxiliaries: boolean;
}

const defaultProperties: Properties = {
  broadcast: false,
  read: false,
  writeWithoutResponse: false,
  write: false,
  notify: false,
  indicate: false,
  authenticatedSignedWrites: false,
  reliableWrite: false,
  writableAuxiliaries: false
};

export default class Characteristic {
  public readonly uuid: string;
  public readonly properties: Properties;
  public adapter: Adapter;
  public service: Service;

  constructor(service: Service, { uuid, properties }: NobleCharacteristic) {
    this.adapter = service.adapter;
    this.service = service;
    this.uuid = uuid;
    this.properties = this.noblePropsToSblendid(properties);
  }

  public async read(): Promise<Buffer> {
    const [, , characteristics] = await this.adapter.run<"characteristicsDiscover">(
      () => this.adapter.discoverCharacteristics(this.peripheral.uuid, this.uuid, []),
      () => this.adapter.when("characteristicsDiscover", ([p, s]) => this.isThisService(p, s))
    );
  }

  public async write(value: Buffer): Promise<void> {}

  public async notify(listener: (value: Buffer) => Promise<void> | void): Promise<void> {}

  private noblePropsToSblendid(nobleProperties: NobleCharacteristicProperty[]): Properties {
    const properties = Object.assign({}, defaultProperties);
    for (const property of nobleProperties) properties[property] = true;
    return properties;
  }
}

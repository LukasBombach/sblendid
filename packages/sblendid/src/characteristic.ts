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
  public readonly uuid: BluetoothCharacteristicUUID;
  public readonly properties: Properties;
  public adapter: Adapter;
  public service: Service;

  private peripheralUuid: string;
  private serviceUuid: BluetoothServiceUUID;

  constructor(service: Service, { uuid, properties }: NobleCharacteristic) {
    this.adapter = service.adapter;
    this.service = service;
    this.uuid = uuid;
    this.peripheralUuid = this.service.peripheral.uuid;
    this.serviceUuid = this.service.uuid;
    this.properties = this.noblePropsToSblendid(properties);
  }

  public async read(): Promise<Buffer> {
    const { peripheralUuid, serviceUuid, uuid } = this;
    const [, , , buffer] = await this.adapter.run<"read">(
      () => this.adapter.read(peripheralUuid, serviceUuid, uuid),
      () => this.adapter.when("read", ([p, s, c]) => this.isThisCharacteristic(p, s, c))
    );
    return buffer;
  }

  public async write(value: Buffer, withoutResponse?: boolean): Promise<void> {
    if (typeof withoutResponse !== "undefined")
      throw new Error("withoutResponse is not Implemented yet");
    const { peripheralUuid, serviceUuid, uuid } = this;
    await this.adapter.run<"write">(
      () => this.adapter.write(peripheralUuid, serviceUuid, uuid, value, true),
      () => this.adapter.when("write", ([p, s, c]) => this.isThisCharacteristic(p, s, c))
    );
  }

  public async notify(listener: (value: Buffer) => Promise<void> | void): Promise<void> {}

  private noblePropsToSblendid(nobleProperties: NobleCharacteristicProperty[]): Properties {
    const properties = Object.assign({}, defaultProperties);
    for (const property of nobleProperties) properties[property] = true;
    return properties;
  }

  private isThisCharacteristic(
    pUuid: string,
    sUuid: BluetoothServiceUUID,
    cUuid: BluetoothCharacteristicUUID
  ): boolean {
    return pUuid === this.peripheralUuid && sUuid === this.serviceUuid && cUuid === this.uuid;
  }
}

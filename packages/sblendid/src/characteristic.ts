import { NobleCharacteristic, NobleCharacteristicProperty } from "sblendid-bindings-macos";

export default class Characteristic {
  public readonly uuid: string;
  public readonly properties: NobleCharacteristicProperty[];

  constructor({ uuid, properties }: NobleCharacteristic) {
    this.uuid = uuid;
    this.properties = properties;
  }
}

export default class Characteristic {
  public readonly uuid: BluetoothCharacteristicUUID;

  constructor(uuid: BluetoothCharacteristicUUID) {
    this.uuid = uuid;
  }
}

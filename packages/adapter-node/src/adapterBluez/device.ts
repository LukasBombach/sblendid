import { Params, Advertisement, ServiceData } from "../types/noble";
import { Device1 } from "./objectManager";
import md5 from "md5";

export default class Device {
  private device1: Device1;

  constructor(device1: Device1) {
    this.device1 = device1;
  }

  public getNobleParams(): Params<"discover"> {
    const { Address, AddressType, Blocked, RSSI } = this.device1;
    const uuid = this.addressToUuid(Address);
    const advertisement = this.getAdvertisement();
    return [uuid, Address, AddressType, !Blocked, advertisement, RSSI];
  }

  private addressToUuid(address: string) {
    const hash = md5(address);
    return [
      hash.substr(0, 8),
      hash.substr(8, 4),
      hash.substr(12, 4),
      hash.substr(16, 4),
      hash.substr(20, 12)
    ].join("-");
  }

  private getAdvertisement(): Advertisement {
    const { Alias, Address, UUIDs, TxPower } = this.device1;
    const localName = Alias === Address.replace(/:/g, "-") ? undefined : Alias;
    const txPowerLevel = TxPower;
    const serviceUuids = UUIDs;
    const manufacturerData = this.getNobleManufacturerData();
    const serviceData = this.getNobleServiceData();
    return {
      localName,
      txPowerLevel,
      serviceUuids,
      manufacturerData,
      serviceData
    };
  }

  private getNobleManufacturerData(): Buffer | undefined {
    const manufacturerValues = Object.values(
      this.device1.ManufacturerData || {}
    );
    if (manufacturerValues.length) return Buffer.from(manufacturerValues[0]);
    return undefined;
  }

  private getNobleServiceData(): ServiceData[] {
    const serviceEntries = Object.entries(this.device1.ServiceData || {});
    return serviceEntries.map(([uuid, bytes]) => ({
      uuid,
      data: Buffer.from(bytes)
    }));
  }
}

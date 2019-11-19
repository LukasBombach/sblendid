import md5 from "md5";
import { Params, Advertisement, ServiceData } from "../../types/noble";
import { InterfaceApi } from "../../types/dbus";
import { PUUID } from "../../types/ble";
import { Device1Props, Device1Api } from "../../types/bluez";
import Bluez from "./bluez";
import List from "../list";

export default class Device {
  private static devices = new List<Device>();
  public readonly uuid: PUUID;
  public readonly path: string;
  public readonly device1: Device1Props;
  private api?: InterfaceApi<Device1Api>;
  private readonly bluez = new Bluez();

  static add(device: Device): void {
    Device.devices.add(device);
  }

  static find(pUUID: PUUID): Device | undefined {
    return Device.devices.find(d => d.uuid === pUUID);
  }

  constructor(path: string, device1: Device1Props) {
    this.uuid = this.getPUUID(device1.Address);
    this.path = path;
    this.device1 = device1;
  }

  public async connect(): Promise<void> {
    const api = await this.getApi();
    await api.Connect();
  }

  public async disconnect(): Promise<void> {
    const api = await this.getApi();
    await api.Disconnect();
  }

  public toNoble(): Params<"discover"> {
    const { Address, AddressType, Blocked, RSSI } = this.device1;
    const uuid = this.getPUUID(Address);
    const advertisement = this.getAdvertisement();
    return [uuid, Address, AddressType, !Blocked, advertisement, RSSI];
  }

  private async getApi(): Promise<InterfaceApi<Device1Api>> {
    if (!this.api) this.api = await this.bluez.getDevice(this.path);
    return this.api;
  }

  private getPUUID(address: string): PUUID {
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
    const manufacturerData = this.device1.ManufacturerData || {};
    const manufacturerValues = Object.values(manufacturerData);
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

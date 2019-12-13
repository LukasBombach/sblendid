import { Params } from "../../types/noble";
import { InterfaceApi } from "../../types/dbus";
import { SUUID } from "../../types/ble";
import { Device1Props, Device1Api } from "../../types/bluez";
import Bluez from "./bluez";
import NoblePeripheral from "./noblePeripheral";
import List from "../list";

export default class Device {
  private static devices = new List<Device>();
  public readonly path: string;
  public readonly device1: Device1Props;
  private api?: InterfaceApi<Device1Api>;

  static add(device: Device): void {
    Device.devices.add(device);
  }

  static find(path: string): Device | undefined {
    return Device.devices.find(d => d.path === path);
  }

  constructor(path: string, device1: Device1Props) {
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

  public async getServiceUUIDs(): Promise<SUUID[]> {
    const api = await this.getApi();
    return await api.getProperty("UUIDs");
  }

  public async servicesResolved(): Promise<boolean> {
    const api = await this.getApi();
    return await api.getProperty("ServicesResolved");
  }

  public async getRssi(): Promise<number> {
    const api = await this.getApi();
    const properties = await api.getProperties();
    const errorMsg = "RSSI cannot be found for the peripheral";
    if (typeof properties.RSSI === "undefined") throw new Error(errorMsg);
    return properties.RSSI;
  }

  public toNoble(): Params<"discover"> {
    return NoblePeripheral.toArray(this.device1);
  }

  private async getApi(): Promise<InterfaceApi<Device1Api>> {
    if (!this.api) this.api = await Bluez.getDevice(this.path);
    return this.api;
  }
}

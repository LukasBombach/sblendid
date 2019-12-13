import md5 from "md5";
import { Params } from "../../types/noble";
import { InterfaceApi } from "../../types/dbus";
import { SUUID } from "../../types/ble";
import { Device1Props, Device1Api } from "../../types/bluez";
import Bluez from "./bluez";
import NoblePeripheral from "./noblePeripheral";
import List from "../list";
import Watcher from "../watcher";
import ObjectManager from "./objectManager";

export default class Device {
  private static devices = new List<Device>();
  public readonly uuid: string;
  public readonly path: string;
  public readonly props: Device1Props;
  private api?: InterfaceApi<Device1Api>;
  private objectManager = new ObjectManager();

  static add(device: Device): void {
    Device.devices.add(device);
  }

  static find(uuid: string): Device | undefined {
    return Device.devices.find(d => d.uuid === uuid);
  }

  constructor(path: string, props: Device1Props) {
    this.uuid = this.getPUUID(props.Address);
    this.path = path;
    this.props = props;
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
    await this.waitUntilServicesAreResolved();
    return await api.getProperty("UUIDs");
  }

  public async servicesResolved(timeout = 50): Promise<boolean> {
    const api = await this.getApi();
    await new Promise(res => setTimeout(res, timeout)); // todo no no no, just no.
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
    return NoblePeripheral.toArray(this.props);
  }

  private async waitUntilServicesAreResolved(): Promise<void> {
    if (await this.servicesResolved()) return;
    const mngr = this.objectManager;
    await Watcher.resolved(mngr, "service", () => this.servicesResolved());
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

  private async getApi(): Promise<InterfaceApi<Device1Api>> {
    if (!this.api) this.api = await Bluez.getDevice(this.path);
    return this.api;
  }
}

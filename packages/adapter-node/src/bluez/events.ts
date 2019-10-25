import { EventEmitter } from "events";
import md5 from "md5";
import { Params, Advertisement, ServiceData } from "../types/nobleAdapter";
import ObjectManager, {
  BluezInterfaces,
  Device,
  Service
} from "./objectManager";

export default class Events extends EventEmitter {
  private objectManager: ObjectManager;

  constructor(objectManager: ObjectManager) {
    super();
    this.objectManager = objectManager;
    this.objectManager.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
    this.on("newListener", () => this.emitManagedObjects());
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.objectManager.getManagedObjects();
    const entries = Object.entries(managedObjects);
    entries.forEach(([path, iface]) => this.onInterfacesAdded(path, iface));
  }

  private onInterfacesAdded(path: string, interfaces: BluezInterfaces): void {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    if (device) this.handleDevice(device, path);
    if (service) this.handleService(service);
  }

  private handleDevice(device: Device, path: string): void {
    const noblePeripheral = this.getNoblePeripheral(device);
    const [pUUID] = noblePeripheral;
    this.devices[pUUID] = path;
    this.emit("discover", ...noblePeripheral);
  }

  private handleService(service: Service): void {
    const { UUID, Device } = service;
    this.services[Device] = this.services[Device] || new Set();
    this.services[Device].add(UUID);
  }

  private getNoblePeripheral(device: Device): Params<"discover"> {
    const { Address, AddressType, Blocked, RSSI } = device;
    const uuid = this.addressToUuid(Address);
    const advertisement = this.getAdvertisement(device);
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

  private getAdvertisement(device: Device): Advertisement {
    const { Alias, Address, UUIDs, TxPower } = device;
    const localName = Alias === Address.replace(/:/g, "-") ? undefined : Alias;
    const txPowerLevel = TxPower;
    const serviceUuids = UUIDs;
    const manufacturerData = this.getNobleManufacturerData(device);
    const serviceData = this.getNobleServiceData(device);
    return {
      localName,
      txPowerLevel,
      serviceUuids,
      manufacturerData,
      serviceData
    };
  }

  private getNobleManufacturerData(device: Device): Buffer | undefined {
    const manufacturerValues = Object.values(device.ManufacturerData || {});
    if (manufacturerValues.length) return Buffer.from(manufacturerValues[0]);
    return undefined;
  }

  private getNobleServiceData(device: Device): ServiceData[] {
    const serviceEntries = Object.entries(device.ServiceData || {});
    return serviceEntries.map(([uuid, bytes]) => ({
      uuid,
      data: Buffer.from(bytes)
    }));
  }
}

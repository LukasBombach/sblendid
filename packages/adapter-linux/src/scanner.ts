import md5 from "md5";
import BluezInterface from "./bluezInterface";
import ObjectManager from "./objectManager";
import Watcher from "./watcher";

import type { FindCondition } from "@sblendid/types/adapter";
import type { PeripheralJSON } from "@sblendid/types/adapter";
import type { BluezDevice, AdapterInterface } from "../types/bluez";

const name = "org.bluez.Adapter1";
const path = "/org/bluez/hci0";

export default class Scanner {
  private adapter = new BluezInterface<AdapterInterface>(name, path);
  private manager = new ObjectManager();

  async startScanning(): Promise<void> {
    await this.adapter.call("StartDiscovery");
  }

  async stopScanning(): Promise<void> {
    await this.adapter.call("StopDiscovery");
  }

  async find(findCondition: FindCondition): Promise<PeripheralJSON> {
    const watcher = this.getWatcher(findCondition);
    await this.startScanning();
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    return peripheral;
  }

  private getWatcher(findCondition: FindCondition): Watcher {
    const condition = this.getDiscoverCondition(findCondition);
    return new Watcher(this.manager, "device1", condition);
  }

  private getDiscoverCondition(findCondition: FindCondition) {
    return async (device: BluezDevice) => {
      const peripheralJSON = this.getPeripheralJSON(device);
      return await findCondition(peripheralJSON);
    };
  }

  private getPeripheralJSON(device: BluezDevice): PeripheralJSON {
    return {
      uuid: md5(device.Address),
      address: device.Address,
      addressType: device.AddressType,
      rssi: device.RSSI,
      txPowerLevel: device.TxPower,
      blocked: device.Blocked,
      name: device.Name,
      serviceUuids: device.UUIDs,
      //manufacturerData: device.ManufacturerData,
    };
  }
}

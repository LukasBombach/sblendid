import Sblendid, { Peripheral, Service, Characteristic } from "../src";

export interface Services {
  read?: Service<any>;
  write?: Service<any>;
  notify?: Service<any>;
}

export interface Characteristics {
  read?: Characteristic<any>;
  write?: Characteristic<any>;
  notify?: Characteristic<any>;
}

export default class Setup {
  public peripheralName = "Find Me";
  private peripheral?: Peripheral;
  private services?: Services;
  private characteristics?: Characteristics;
  private static singleton?: Setup;

  public static getSingleton(): Setup {
    if (!Setup.singleton) Setup.singleton = new Setup();
    return Setup.singleton;
  }

  public async getPeripheral(): Promise<Peripheral> {
    if (!this.peripheral) this.peripheral = await this.findPeripheral();
    return this.peripheral;
  }

  public async getService(type: keyof Services): Promise<Service> {
    if (!this.services) this.services = {};
    if (!this.services[type]) {
      this.services[type] = await this.findService(type);
    }
    return this.services[type] as Service<any>;
  }

  public async getCharacteristic(
    type: keyof Characteristics
  ): Promise<Characteristic> {
    if (!this.characteristics) this.characteristics = {};
    if (!this.characteristics[type]) {
      this.characteristics[type] = await this.findCharacteristic(type);
    }
    return this.characteristics[type] as Characteristic<any>;
  }

  private async findPeripheral(): Promise<Peripheral> {
    const sblendid = await Sblendid.powerOn();
    return await sblendid.find(this.peripheralName);
  }

  private async findService(type: keyof Services): Promise<Service> {
    const characteristic = await this.getCharacteristic(type);
    return characteristic.service;
  }

  private async findCharacteristic(
    type: keyof Services
  ): Promise<Characteristic> {
    const peripheral = await this.getPeripheral();
    const services = await peripheral.getServices();
    for (const service of services) {
      const characteristics = await service.getCharacteristics();
      const characteristic = characteristics.find(c => !!c.properties[type]);
      if (characteristic) return characteristic;
    }
    const msg = `Could not find characteristic that has allows a ${type} operation`;
    throw new Error(msg);
  }
}

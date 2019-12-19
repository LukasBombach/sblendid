import SystemBus from "./systemBus";

type CallbackWithValue = (error: Error | null, value: any) => void;

interface InterfaceMethods {
  getProperty: (name: string, callback: CallbackWithValue) => void;
}

export default class DBusInterface<T extends InterfaceMethods> {
  public readonly service: string;
  public readonly path: string;
  public readonly name: string;
  private systemBus = new SystemBus();
  private dbusInterface?: T;

  constructor(service: string, path: string, name: string) {
    this.service = service;
    this.path = path;
    this.name = name;
  }

  private async getDBusInterface(): Promise<T> {
    if (!this.dbusInterface) {
      this.dbusInterface = await this.fetchDBusInterface();
    }
    return this.dbusInterface;
  }

  private fetchDBusInterface(): Promise<T> {
    const { service, path, name } = this;
    return this.systemBus.getInterface({ service, path, name }) as any; // todo unlawful typecast
  }
}

//  private instances = new Set<T>();
/* // todo this will pobably allow duplicate devices and services as they are different objects / pointers
public add(device: T): void {
this.instances.add(device);
}

find(predicate: (value: T) => unknown): T | undefined {
return [...this.instances].find(predicate);
}

findAll(callback: (value: T) => boolean): T[] {
return [...this.instances].filter(callback);
} */

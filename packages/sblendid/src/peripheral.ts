import Adapter, { Params } from "@sblendid/adapter-node";
import Service from "./service";

// type AddressType = ?
// type Advertisement = ?

export default class Peripheral {
  public adapter: Adapter;
  public uuid: PUUID;
  public name?: string;
  public address?: string;
  public addressType?: AddressType;
  public connectable?: boolean;
  public advertisement: Advertisement = {};
  public manufacturerData: Buffer = Buffer.from("");
  public state: PeripheralState = "disconnected";
  private serviceUuids?: SUUID[];

  public static fromDiscover(
    adapter: Adapter,
    params: Params<"discover">
  ): Peripheral {
    const p = new Peripheral(adapter, params[0]);
    p.address = params[1];
    p.addressType = params[2];
    p.connectable = params[3];
    p.advertisement = params[4] || {};
    p.manufacturerData = p.advertisement.manufacturerData || Buffer.from("");
    p.name = p.advertisement.localName || p.manufacturerData.toString("hex");
    return p;
  }

  constructor(adapter: Adapter, uuid: string) {
    this.adapter = adapter;
    this.uuid = uuid;
  }

  public async connect(): Promise<void> {
    if (this.state !== "disconnected") return;
    this.state = "connecting";
    await this.adapter.connect(this.uuid);
    this.state = "connected";
  }

  public async disconnect(): Promise<void> {
    if (this.state !== "connected") return;
    this.state = "disconnecting";
    await this.adapter.disconnect(this.uuid);
    this.state = "disconnected";
  }

  public async getService<C>(
    uuid: SUUID,
    converters: C
  ): Promise<Service<C> | undefined> {
    const services = await this.getServices({ [uuid]: converters });
    return services.find(s => s.uuid === uuid);
  }

  public async getServices(
    converterMap: Record<string, any> = {}
  ): Promise<Service<any>[]> {
    if (this.state === "disconnected") await this.connect();
    if (!this.serviceUuids)
      this.serviceUuids = await this.adapter.getServices(this.uuid);
    return this.serviceUuids.map(
      uuid => new Service(this, uuid, converterMap[uuid])
    );
  }

  public async hasService(uuid: SUUID): Promise<boolean> {
    const services = await this.getServices();
    return services.some(s => s.uuid === uuid);
  }

  public async getRssi(): Promise<number> {
    if (this.state === "disconnected") await this.connect();
    return await this.adapter.getRssi(this.uuid);
  }

  public isConnected(): boolean {
    return this.state === "connected";
  }
}

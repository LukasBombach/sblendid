import Adapter, {
  AddressType,
  Advertisement,
  Params
} from "@sblendid/adapter-node";
import Service from "./service";
import { Converter } from "./characteristic";

export default class Peripheral {
  public adapter: Adapter;
  public uuid: PUUID;
  public name: string;
  public address: string;
  public addressType: AddressType;
  public connectable?: boolean;
  public advertisement: Advertisement = {};
  public manufacturerData: Buffer = Buffer.from("");
  public state: PeripheralState = "disconnected";
  private serviceUuids?: SUUID[];

  constructor(adapter: Adapter, props: Params<"discover">) {
    const [uuid, address, addressType, connectable, advertisement] = props;
    const { manufacturerData, localName } = advertisement;
    this.adapter = adapter;
    this.uuid = uuid;
    this.address = address;
    this.addressType = addressType;
    this.connectable = connectable;
    this.advertisement = advertisement;
    this.manufacturerData = manufacturerData || Buffer.from("");
    this.name = localName || this.manufacturerData.toString("hex");
  }

  public async connect(): Promise<void> {
    console.log("🔴 called connect");
    // debugger;
    if (this.state !== "disconnected") return;
    console.log("🔴 passed disconnected guard");
    this.state = "connecting";
    console.log("🔴 set state to connecting, calling adapter.connect");
    console.log("🔴 ", this.adapter.connect.toString());
    await this.adapter.connect(this.uuid);
    console.log("🔴 adapter.connect returned");
    this.state = "connected";
    console.log("🔴 set state to connected");
  }

  public async disconnect(): Promise<void> {
    if (this.state !== "connected") return;
    this.state = "disconnecting";
    await this.adapter.disconnect(this.uuid);
    this.state = "disconnected";
  }

  public async getService<C extends Converter<any>[]>(
    uuid: SUUID,
    converters: C
  ): Promise<Service<C> | undefined> {
    const services = await this.getServices({ [uuid]: converters });
    return services[0];
  }

  public async getServices<C extends Converter<any>[]>(
    converterMap: Record<string, C> = {}
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

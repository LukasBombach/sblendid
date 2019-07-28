import Sblendid, { Peripheral, Service, Adapter } from "sblendid/src";
import converters from "./converters";

export default class DE1 {
  private machine?: Peripheral;
  private service?: Service;

  public getAdapter(): Adapter {
    if (!this.machine) throw new Error("No Machine, not connected?");
    return this.machine.adapter;
  }

  public static async connect(): Promise<DE1> {
    const de1 = new DE1();
    await de1.connect();
    return de1;
  }

  public async connect(): Promise<void> {
    if (this.isConnected()) return;
    this.machine = await Sblendid.connect("DE1");
    this.service = await this.machine.getService("a000", converters);
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected()) return;
    await this.machine!.disconnect();
    this.machine = undefined;
    this.service = undefined;
  }

  public async turnOn(): Promise<State> {
    if (!(await this.isTurnedOn())) await this.set("state", "idle");
    return await this.get("state");
  }

  public async turnOff(): Promise<State> {
    await this.set("state", "sleep");
    return await this.get("state");
  }

  public async isTurnedOn(): Promise<boolean> {
    return (await this.get("state")) !== "sleep";
  }

  public async startEspresso(): Promise<void> {
    return await this.set("state", "espresso");
  }

  public async getWaterlevel(): Promise<number> {
    return (await this.get("water")).level;
  }

  public isConnected(): boolean {
    if (!this.machine) return false;
    return this.machine.isConnected();
  }

  public async get(name: Prop): Promise<any> {
    return await this.getService().read(name);
  }

  public async set(name: Prop, value: any): Promise<any> {
    return await this.getService().write(name, value);
  }

  public on(name: Prop, listener: PropListener<Prop>): void {
    this.getService().on(name, listener);
  }

  public off(name: Prop, listener: PropListener<Prop>): void {
    this.getService().off(name, listener);
  }

  private getService(): Service {
    if (!this.isConnected()) throw new Error("Not connected to DE1");
    if (!this.service) throw new Error("Could not read service");
    return this.service;
  }
}

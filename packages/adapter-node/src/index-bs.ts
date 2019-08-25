import getBindings from "./bindings";
import BindingsType from "./types/bindings";

const Bindings = getBindings();

export default class Adapter {
  private bindings: BindingsType = new Bindings();

  private async startNotifing(): Promise<void> {
    if (this.isNotifying) return;
    this.bindings.on("read", this.onNotify.bind(this));
    this.isNotifying = await this.notify(true);
  }

  private async stopNotifing(): Promise<void> {
    if (!this.isNotifying) return;
    this.bindings.off("read", this.onNotify.bind(this));
    this.isNotifying = await this.notify(false);
  }

  private async dispatchRead(): Promise<Buffer> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    return await this.bindings.run<"read", Buffer>(
      () => this.bindings.read(pUuid, sUuid, uuid),
      () => this.bindings.when("read", (p, s, c) => this.isThis(p, s, c)),
      ([, , , buffer]) => buffer
    );
  }

  private async dispatchWrite(value: Buffer): Promise<void> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    await this.bindings.run<"write">(
      () => this.bindings.write(pUuid, sUuid, uuid, value, false),
      () => this.bindings.when("write", (p, s, c) => this.isThis(p, s, c))
    );
  }

  private async notify(notify: boolean): Promise<boolean> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    return await this.bindings.run<"notify", boolean>(
      () => this.bindings.notify(pUuid, sUuid, uuid, notify),
      () => this.bindings.when("notify", (p, s, c) => this.isThis(p, s, c)),
      ([, , , state]) => state // todo this should not be an array??
    );
  }

  private async fetchServices(): Promise<SUUID[]> {
    return await this.bindings.run<"servicesDiscover", SUUID[]>(
      () => this.bindings.discoverServices(this.uuid, []),
      () => this.bindings.when("servicesDiscover", uuid => uuid === this.uuid),
      ([, serviceUuids]) => serviceUuids
    );
  }

  private async fetchRssi(): Promise<number> {
    return await this.bindings.run<"rssiUpdate", number>(
      () => this.bindings.updateRssi(this.uuid),
      () => this.bindings.when("rssiUpdate", uuid => uuid === this.uuid),
      ([, rssi]) => rssi
    );
  }

  private async dispatchConnect(): Promise<void> {
    await this.bindings.run(
      () => this.bindings.connect(this.uuid),
      () => this.bindings.when("connect", uuid => uuid === this.uuid)
    );
  }

  private async dispatchDisconnect(): Promise<void> {
    await this.bindings.run(
      () => this.bindings.disconnect(this.uuid),
      () => this.bindings.when("disconnect", uuid => uuid === this.uuid)
    );
  }

  public async powerOn(): Promise<void> {
    await this.bindings.run(
      () => this.bindings.init(),
      () => this.bindings.when("stateChange", state => state === "poweredOn")
    );
  }

  public async find(
    condition: string | PeripheralListener
  ): Promise<Peripheral> {
    return await this.bindings.run<"discover", Peripheral>(
      () => this.bindings.startScanning(),
      () => this.bindings.when("discover", this.getFindCondition(condition)),
      () => this.bindings.stopScanning(),
      peripheral => Peripheral.fromDiscover(this.bindings, peripheral)
    );
  }

  public startScanning(
    listener: (peripheral: Peripheral) => void = () => {}
  ): void {
    this.bindings.off("discover", this.scanListener);
    this.scanListener = this.bindings.asPeripheral(listener);
    this.bindings.on("discover", this.scanListener);
    this.bindings.startScanning();
  }

  public stopScanning(): void {
    this.bindings.off("discover", this.scanListener);
    this.scanListener = () => {};
    this.bindings.stopScanning();
  }

  private getFindCondition(
    condition: string | PeripheralListener
  ): EventListener<"discover"> {
    if (typeof condition === "function")
      return this.bindings.asPeripheral(condition);
    return this.bindings.asPeripheral(p =>
      [p.uuid, p.address, p.name].includes(condition)
    );
  }

  private async fetchCharacteristics(): Promise<NBC[]> {
    const [puuid, uuid] = this.getIds();
    const isThis = (p: string, s: SUUID) => this.isThis(p, s);
    return await this.bindings.run<"characteristicsDiscover", NBC[]>(
      () => this.bindings.discoverCharacteristics(puuid, uuid, []),
      () => this.bindings.when("characteristicsDiscover", isThis),
      ([, , characteristics]) => characteristics
    );
  }
}

import Adapter, { FindCondition, Characteristic } from "./adapter";
import { Event, Params, Listener } from "./types/nobleAdapter";
import Bluez from "./bluez";

export default class DBusAdapter extends Adapter {
  private bluez = new Bluez();

  public async init(): Promise<void> {
    await this.bluez.init();
  }

  public async startScanning(): Promise<void> {
    await this.bluez.startScanning();
  }

  public async stopScanning(): Promise<void> {
    await this.bluez.stopScanning();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    return await this.run<"discover">(
      () => this.startScanning(),
      () => this.when("discover", condition),
      () => this.stopScanning()
    );
  }

  public async connect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet (connect)");
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet (disconnect)");
  }

  public async getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet (getRssi)");
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    throw new Error("Not implemented yet (getServices)");
  }

  public async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    throw new Error("Not implemented yet (getCharacteristics)");
  }

  public async read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    throw new Error("Not implemented yet (read)");
  }

  public async write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    throw new Error("Not implemented yet (write)");
  }

  public async notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    throw new Error("Not implemented yet (notify)");
  }

  public async on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    this.bluez.on(event, listener as any); // todo any cast
  }

  public async off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    this.bluez.off(event, listener as any); // todo any cast
  }
}

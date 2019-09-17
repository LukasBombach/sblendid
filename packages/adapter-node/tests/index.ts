import NodeAdapter from "../src/index";
import { first, count } from "./utils/events";
import "./matchers/events";

describe("SblendidNodeAdapter", () => {
  const adapter = new NodeAdapter();

  beforeAll(async () => {
    await adapter.powerOn();
  });

  it("enables the usage of the BLE adapter", async () => {
    const secondAdapter = new NodeAdapter();
    await expect(secondAdapter.powerOn()).resolves.toBe(undefined);
  });

  it("doesn't crash when initialized multiple times", async () => {
    const secondAdapter = new NodeAdapter();
    await expect(secondAdapter.powerOn()).resolves.toBe(undefined);
    await expect(secondAdapter.powerOn()).not.rejects.toThrow();
  });

  it(`can scan for peripherals`, async () => {
    adapter.startScanning();
    await expect(first(adapter, "discover")).resolves.toBeEvent("discover");
    adapter.stopScanning();
  });

  it("can stop scanning for peripherals", async () => {
    adapter.startScanning();
    await first(adapter, "discover");
    adapter.stopScanning();
    await expect(count(adapter, "discover", 400)).resolves.toBe(0);
  });

  it("", async () => {
    // find(condition: FindCondition): Promise<Params<"discover">>
  });

  it("", async () => {
    // connect(pUUID: PUUID): Promise<void>
  });

  it("", async () => {
    // disconnect(pUUID: PUUID): Promise<void>
  });

  it("", async () => {
    // getServices(pUUID: PUUID): Promise<SUUID[]>
  });

  it("", async () => {
    // getRssi(pUUID: PUUID): Promise<number>
  });

  it("", async () => {
    // on<E extends Event>(event: E, listener: Listener<E>): void
  });

  it("", async () => {
    // off<E extends Event>(event: E, listener: Listener<E>): void
  });

  it("", async () => {
    /* public getCharacteristics(
      pUUID: PUUID,
      sUUID: SUUID
    ): Promise<CharacteristicData[]> {
      return this.service.getCharacteristics(pUUID, sUUID);
    } */
  });

  it("", async () => {
    /* public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    return this.characteristic.read(pUUID, sUUID, cUUID);
  } */
  });

  it("", async () => {
    /* public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse = false
  ): Promise<void> {
    return this.characteristic.write(
      pUUID,
      sUUID,
      cUUID,
      value,
      withoutResponse
    );
  } */
  });

  it("", async () => {
    /* public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    return this.characteristic.notify(pUUID, sUUID, cUUID, notify);
  } */
  });
});

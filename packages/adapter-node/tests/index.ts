import NodeAdapter, { Params } from "../src/index";
import { first, count } from "./utils/events";
import { isConnectable, hasName } from "./utils/peripheral";
import "./matchers/schema";
import "./matchers/events";

describe("SblendidNodeAdapter", () => {
  const adapter = new NodeAdapter();
  const name = "Find Me";
  let peripheral: Params<"discover">;
  let puuid: string;

  beforeAll(async () => {
    await adapter.powerOn();
    peripheral = await adapter.find(hasName(name));
    puuid = peripheral[0];
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

  it(`scans for peripherals`, async () => {
    adapter.startScanning();
    await expect(first(adapter, "discover")).resolves.toBeEvent("discover");
    adapter.stopScanning();
  });

  it("stops scanning for peripherals", async () => {
    adapter.startScanning();
    await first(adapter, "discover");
    adapter.stopScanning();
    await expect(count(adapter, "discover", 400)).resolves.toBe(0);
  });

  it("finds a peripheral", async () => {
    let peripheralFound: Params<"discover">;
    const condition = isConnectable(p => (peripheralFound = p));
    const peripheral = await adapter.find(condition);
    expect(peripheral).toBeEvent("discover");
    expect(peripheral).toBe(peripheralFound!);
  });

  it("connects without throwing an error", async () => {
    await expect(adapter.connect(puuid)).resolves.toBe(undefined);
    await adapter.disconnect(puuid);
  });

  it("disconnect without throwing an error", async () => {
    await adapter.connect(puuid);
    await expect(adapter.disconnect(puuid)).resolves.toBe(undefined);
  });

  it("reads service puuids from a peripheral", async () => {
    const services = await adapter.getServices(puuid);
    expect(services.sort()).toMatchSnapshot();
  });

  it("reads a peripherals RSSI", async () => {
    await expect(adapter.getRssi(puuid)).resolves.toBe(expect.any(Number));
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
    ): Promise<CharacteristicData[]>*/
  });

  it("", async () => {
    /* public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer>  */
  });

  it("", async () => {
    /* public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse = false
  ): Promise<void>  */
  });

  it("", async () => {
    /* public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> */
  });
});

import NodeAdapter, { Params } from "../src/index";
import { first, count } from "./utils/events";
import {
  ArrayOfBluetoothServiceUUIDs,
  ArrayOfCharacteristicData
} from "./utils/types";
import { hasName } from "./utils/peripheral";
import { findCharacteristic } from "./utils/characteristic";
import "./matchers/schema";
import "./matchers/events";

describe("Sblendid Node Adapter", () => {
  const adapter = new NodeAdapter();
  const name = "Find Me";
  const deviceInfo = "180a";
  const model = "2a24";

  let puuid: string;

  beforeAll(async () => {
    await adapter.powerOn();
    [puuid] = await adapter.find(hasName(name));
  });

  afterAll(async () => {
    await adapter.powerOff();
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
    const condition = hasName(name, p => (peripheralFound = p));
    const peripheral = await adapter.find(condition);
    expect(peripheral).toBeEvent("discover");
    expect(peripheral).toEqual(peripheralFound!);
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
    await adapter.connect(puuid);
    const services = await adapter.getServices(puuid);
    expect(services).toMatchSchema(ArrayOfBluetoothServiceUUIDs);
  });

  it.todo(
    "throws an error when a user reads service UUUIDs without being connected"
  );

  it("reads a peripherals RSSI", async () => {
    await adapter.connect(puuid);
    await expect(adapter.getRssi(puuid)).resolves.toEqual(expect.any(Number));
  });

  it.todo("listens for events");

  it.todo("stops listening for events");

  it("reads characteristic data", async () => {
    const data = await adapter.getCharacteristics(puuid, deviceInfo);
    expect(data).toMatchSchema(ArrayOfCharacteristicData);
  });

  it("reads data into a buffer", async () => {
    await adapter.connect(puuid);
    await adapter.getServices(puuid);
    await adapter.getCharacteristics(puuid, deviceInfo);
    const buffer = await adapter.read(puuid, deviceInfo, model);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toMatch(/.+/);
  }, 5000);

  it("writes data to a characteristic", async () => {
    await adapter.connect(puuid);
    await adapter.getServices(puuid);
    const writableCUUID = await findCharacteristic(adapter, puuid, "write");
    const [suuid, cuuid] = writableCUUID!;
    const buffer = Buffer.from("message", "utf8");
    const write = adapter.write(puuid, suuid, cuuid, buffer);
    await expect(write).resolves.toBe(undefined);
  });

  it("writes data to a characteristic without response", async () => {
    await adapter.connect(puuid);
    await adapter.getServices(puuid);
    const writableCUUID = await findCharacteristic(adapter, puuid, "write");
    const [suuid, cuuid] = writableCUUID!;
    const buffer = Buffer.from("message", "utf8");
    const write = adapter.write(puuid, suuid, cuuid, buffer, true);
    await expect(write).resolves.toBe(undefined);
  });

  it("turns notifications on", async () => {
    await adapter.connect(puuid);
    await adapter.getServices(puuid);
    const notifyableCUUID = await findCharacteristic(adapter, puuid, "notify");
    const [suuid, cuuid] = notifyableCUUID!;
    const notify = adapter.notify(puuid, suuid, cuuid, true);
    await expect(notify).resolves.toBe(true);
  });

  it("turns notifications off", async () => {
    await adapter.connect(puuid);
    await adapter.getServices(puuid);
    const notifyableCUUID = await findCharacteristic(adapter, puuid, "notify");
    const [suuid, cuuid] = notifyableCUUID!;
    const notify = adapter.notify(puuid, suuid, cuuid, false);
    await expect(notify).resolves.toBe(false);
  });
});

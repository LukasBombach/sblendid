import Adapter from "@sblendid/adapter-node";
import Sblendid, {
  Service,
  Peripheral,
  PeripheralOptions as Options
} from "../src";

describe("Peripheral", () => {
  const name = "Find Me";
  const serviceUUID = "180a";
  const converters = {
    manufacturer: {
      uuid: "2a29",
      decode: (buffer: Buffer) => buffer.toString()
    },
    model: {
      uuid: "2a24",
      decode: (buffer: Buffer) => buffer.toString()
    }
  };
  const minOptions: Options = {
    address: "address",
    addressType: "public",
    advertisement: {}
  };
  const options: [string, Options][] = [
    ["has minimum options", minOptions],
    ["is connectable", { ...minOptions, connectable: true }],
    ["is not connectable", { ...minOptions, connectable: false }],
    ["has as name", { ...minOptions, advertisement: { localName: "name" } }]
  ];
  let connnectSpy: jest.SpyInstance<Promise<void>, [string]>;
  let disconnnectSpy: jest.SpyInstance<Promise<void>, [string]>;
  let peripheral: Peripheral;

  beforeAll(async () => {
    const sblendid = await Sblendid.powerOn();
    peripheral = await sblendid.find(name);
    connnectSpy = jest.spyOn(peripheral.adapter, "connect");
    disconnnectSpy = jest.spyOn(peripheral.adapter, "disconnect");
  }, 10000);

  beforeEach(async () => {
    await peripheral.connect();
    connnectSpy.mockClear();
    disconnnectSpy.mockClear();
  });

  afterAll(async () => {
    await peripheral.disconnect();
    connnectSpy.mockRestore();
    disconnnectSpy.mockRestore();
  });

  it.each(options)("creates a new peripheral that %s", async (_, opts) => {
    const adapter = new Adapter();
    const peripheral = new Peripheral("uuid", adapter, opts);
    expect(peripheral.uuid).toBe("uuid");
    expect(peripheral.adapter).toBe(adapter);
    expect(peripheral.name).toBe(opts.advertisement.localName || "");
    expect(peripheral.address).toBe(opts.address);
    expect(peripheral.addressType).toBe(opts.addressType);
    expect(peripheral.advertisement).toBe(opts.advertisement);
    expect(peripheral.connectable).toBe(opts.connectable);
    expect(peripheral.state).toBe("disconnected");
  });

  it("connects to peripheral", async () => {
    await peripheral.disconnect();
    await expect(peripheral.connect()).resolves.toBe(undefined);
    expect(connnectSpy).toBeCalledTimes(1);
    await peripheral.disconnect();
  }, 10000);

  it("does not connect to peripheral if it is already connected", async () => {
    await peripheral.disconnect();
    await expect(peripheral.connect()).resolves.toBe(undefined);
    await expect(peripheral.connect()).resolves.toBe(undefined);
    expect(connnectSpy).toBeCalledTimes(1);
    await peripheral.disconnect();
  }, 10000);

  it("does updates the state when it connects", async () => {
    await peripheral.disconnect();
    expect(peripheral.state).toBe("disconnected");
    await peripheral.connect();
    expect(peripheral.state).toBe("connected");
  }, 10000);

  it("disconnects from peripheral", async () => {
    await expect(peripheral.disconnect()).resolves.toBe(undefined);
    expect(disconnnectSpy).toBeCalledTimes(1);
  }, 10000);

  it("does not disconnect from peripheral if it is already disconnected", async () => {
    await expect(peripheral.disconnect()).resolves.toBe(undefined);
    await expect(peripheral.disconnect()).resolves.toBe(undefined);
    expect(disconnnectSpy).toBeCalledTimes(1);
  }, 10000);

  it("does updates the state when it disconnects", async () => {
    expect(peripheral.state).toBe("connected");
    await peripheral.disconnect();
    expect(peripheral.state).toBe("disconnected");
  }, 10000);

  it("gets undefined when requesting a service that is not available", async () => {
    const service = await peripheral.getService("UUIDThatCannotBeThere");
    expect(service).toBe(undefined);
  }, 10000);

  it("gets a service from a peripheral (even disconnected)", async () => {
    await peripheral.disconnect();
    const service = await peripheral.getService(serviceUUID);
    expect(service).toBeInstanceOf(Service);
    expect(service!.uuid).toBe(serviceUUID);
  }, 10000);

  it("gets a service from a peripheral (with converters)", async () => {
    const service = await peripheral.getService(serviceUUID, converters);
    expect(service).toBeInstanceOf(Service);
    expect(service!.uuid).toBe(serviceUUID);
    expect(service!["converters"]).toBe(converters);
  }, 10000);

  it("gets all services from a peripheral (even disconnected)", async () => {
    await peripheral.disconnect();
    const services = await peripheral.getServices();
    expect(services).toSatisfyAll(s => s instanceof Service);
  }, 10000);

  it("returns fallbacks if a peripheral is not connectable", async () => {
    const adapter = new Adapter();
    const options = { ...minOptions, connectable: false };
    const peripheral = new Peripheral("uuid", adapter, options);
    await expect(peripheral.getServices()).resolves.toEqual([]);
    await expect(peripheral.getRssi()).resolves.toBe(undefined);
  }, 10000);

  it("gets all services from a peripheral (with converters)", async () => {
    const converterMap = { [serviceUUID]: converters };
    const services = await peripheral.getServices(converterMap);
    const deviceInfoService = services.find(s => s.uuid === serviceUUID);
    expect(services).toSatisfyAll(s => s instanceof Service);
    expect(deviceInfoService!["converters"]).toBe(converters);
  }, 10000);

  it("says when a peripheral has a service", async () => {
    await expect(peripheral.hasService(serviceUUID)).resolves.toBe(true);
  }, 10000);

  it("says when a peripheral does not have a service", async () => {
    await expect(peripheral.hasService("UUIDThatCannotBeThere")).resolves.toBe(
      false
    );
  }, 10000);

  it("returns true when a peripheral is connected", async () => {
    await peripheral.connect();
    expect(peripheral.isConnected()).toBe(true);
  }, 10000);

  it("returns false when a peripheral is not connected", async () => {
    await peripheral.disconnect();
    expect(peripheral.isConnected()).toBe(false);
  }, 10000);

  it("returns the RSSI of a peripheral", async () => {
    await expect(peripheral.getRssi()).resolves.toEqual(expect.any(Number));
  }, 10000);

  it("returns the RSSI of a peripheral for a disconnected peripheral", async () => {
    await peripheral.disconnect();
    await expect(peripheral.getRssi()).resolves.toEqual(expect.any(Number));
  }, 10000);
});

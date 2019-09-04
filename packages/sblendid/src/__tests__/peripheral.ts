import Sblendid from "../sblendid";
import Peripheral from "../peripheral";
import Service from "../service";

describe("Peripheral", () => {
  const name = "Find Me";
  const serviceUUID = "180a";
  const converters = [
    {
      uuid: "2a29",
      name: "manufacturer",
      decode: (buffer: Buffer) => buffer.toString()
    },
    {
      uuid: "2a24",
      name: "model",
      decode: (buffer: Buffer) => buffer.toString()
    }
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
    await peripheral.disconnect();
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
    expect(services.map(s => s.uuid).sort()).toMatchSnapshot();
  }, 10000);

  it("gets all services from a peripheral (with converters)", async () => {
    const converterMap = { [serviceUUID]: converters };
    const services = await peripheral.getServices(converterMap);
    const deviceInfoService = services.find(s => s.uuid === serviceUUID);
    expect(services.map(s => s.uuid).sort()).toMatchSnapshot();
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

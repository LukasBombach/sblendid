import Sblendid from "../sblendid";
import Peripheral from "../peripheral";

describe("Peripheral", () => {
  const name = "Find Me";
  let connnectSpy: jest.SpyInstance<Promise<void>, [string]>;
  let disconnnectSpy: jest.SpyInstance<Promise<void>, [string]>;
  let peripheral: Peripheral;

  beforeAll(async () => {
    const sblendid = await Sblendid.powerOn();
    peripheral = await sblendid.find(name);
    connnectSpy = jest.spyOn(peripheral.adapter, "connect");
    disconnnectSpy = jest.spyOn(peripheral.adapter, "disconnect");
  }, 10000);

  beforeEach(() => {
    connnectSpy.mockClear();
    disconnnectSpy.mockClear();
  });

  afterAll(async () => {
    await peripheral.disconnect();
    connnectSpy.mockRestore();
    disconnnectSpy.mockRestore();
  });

  it("connects to peripheral", async () => {
    await expect(peripheral.connect()).resolves.toBe(undefined);
    expect(connnectSpy).toBeCalledTimes(1);
    await peripheral.disconnect();
  }, 10000);

  it("does not connect to peripheral if it is already connected", async () => {
    await expect(peripheral.connect()).resolves.toBe(undefined);
    await expect(peripheral.connect()).resolves.toBe(undefined);
    expect(connnectSpy).toBeCalledTimes(1);
    await peripheral.disconnect();
  }, 10000);

  it("does updates the state when it connects", async () => {
    expect(peripheral.state).toBe("disconnected");
    await peripheral.connect();
    expect(peripheral.state).toBe("connected");
    await peripheral.disconnect();
  }, 10000);

  it("disconnects from peripheral", async () => {
    await peripheral.connect();
    await expect(peripheral.disconnect()).resolves.toBe(undefined);
    expect(disconnnectSpy).toBeCalledTimes(1);
  }, 10000);

  it("does not disconnect from peripheral if it is already disconnected", async () => {
    await peripheral.connect();
    await expect(peripheral.disconnect()).resolves.toBe(undefined);
    await expect(peripheral.disconnect()).resolves.toBe(undefined);
    expect(disconnnectSpy).toBeCalledTimes(1);
  }, 10000);

  it("does updates the state when it disconnects", async () => {
    await peripheral.connect();
    expect(peripheral.state).toBe("connected");
    await peripheral.disconnect();
    expect(peripheral.state).toBe("disconnected");
  }, 10000);

  it("gets a service from a peripheral", async () => {
    // getService( uuid, converters )
  }, 10000);

  it("gets a service from a peripheral (with converters)", async () => {
    // getService( uuid, converters )
  }, 10000);

  it("gets all services from a peripheral", async () => {
    // getServices(converterMap)
  }, 10000);

  it("gets all services from a peripheral (with converters)", async () => {
    // getServices(converterMap)
  }, 10000);

  it("says when a peripheral has a service", async () => {
    // hasService(uuid)
  }, 10000);

  it("says when a peripheral does not have a service", async () => {
    // hasService(uuid)
  }, 10000);

  it("says when a peripheral is connected", async () => {
    // isConnected()
  }, 10000);

  it("says when a peripheral is not connected", async () => {
    // isConnected()
  }, 10000);
});

import Adapter from "@sblendid/adapter-node";
import Sblendid from "../sblendid";
import Peripheral from "../peripheral";

describe("Peripheral", () => {
  const name = "Find Me";
  const adapter = new Adapter();
  let connnectSpy: jest.SpyInstance<Promise<void>, [string]>;
  let peripheral: Peripheral;

  beforeAll(async () => {
    const sblendid = await Sblendid.powerOn();
    peripheral = await sblendid.find(name);
    connnectSpy = jest
      .spyOn(peripheral.adapter, "connect")
      .mockImplementation((uuid: string) => {
        console.log(
          "🌕 mock is getting called, calling adapter.peripheral.connect"
        );
        console.log("🌕 adapter method is", adapter.connect.toString());

        return adapter.connect(uuid);
      });

    console.log("🌕 mocked method is", peripheral.adapter.connect.toString());
  }, 10000);

  beforeEach(() => {
    connnectSpy.mockReset();
  });

  afterAll(async () => {
    await peripheral.disconnect();
    connnectSpy.mockRestore();
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
  }, 10000);

  it("does updates the state when it connects", async () => {
    // connect()
  }, 10000);

  it("disconnects from peripheral", async () => {
    // disconnect()
  }, 10000);

  it("does not disconnect from peripheral if it is already disconnected", async () => {
    // disconnect()
  }, 10000);

  it("does updates the state when it disconnects", async () => {
    // disconnect()
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

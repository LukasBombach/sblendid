import Service from "../src/service";
import Sblendid from "../src/sblendid";
import Peripheral from "../src/peripheral";

describe.only("Service", () => {
  const name = "Find Me";
  const deviceInfoUUID = "180a";
  const manufacturerUUID = "2a29";
  const alertUUID = "2a06";

  let peripheral: Peripheral;
  let services: Service<any>[];

  const converters = {
    manufacturer: {
      uuid: "2a29",
      decode: (buffer: Buffer) => buffer.toString()
    },
    model: {
      uuid: "2a24",
      decode: (buffer: Buffer) => buffer.toString()
    },
    alert: {
      uuid: "2a06",
      decode: (buffer: Buffer) => buffer.toString(),
      encode: (message: string) => Buffer.from(message, "utf8")
    }
  };

  beforeAll(async () => {
    peripheral = await Sblendid.connect(name);
    // todo this needs to be done before services can be used directly
    // todo this must be done automatically by the service class
    services = await peripheral.getServices();
  }, 10000);

  afterAll(async () => {
    await peripheral.disconnect();
  });

  it("can be instantiated without converters", async () => {
    expect(() => new Service(peripheral, deviceInfoUUID)).not.toThrow();
  }, 10000);

  it("can be instantiated with converters", async () => {
    expect(
      () => new Service(peripheral, deviceInfoUUID, converters)
    ).not.toThrow();
  }, 10000);

  it.skip("invalidates converters", async () => {
    const faulyConverters = { ...converters, model: converters.model };
    expect(
      () => new Service(peripheral, deviceInfoUUID, faulyConverters)
    ).toThrow("Duplicate UUIDs");
  }, 10000);

  it("reads a characteristic using its UUID", async () => {
    const deviceInfoService = new Service(peripheral, deviceInfoUUID);
    const buffer = await deviceInfoService.read(manufacturerUUID);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toMatch(/.+/);
  }, 10000);

  it("reads a characteristic using a converter name", async () => {
    const deviceInfoService = new Service(
      peripheral,
      deviceInfoUUID,
      converters
    );
    const value = await deviceInfoService.read("manufacturer");
    expect(typeof value).toBe("string");
    expect(value).toMatch(/.+/);
  }, 10000);

  it("writes a characteristic using its UUID", async () => {
    const deviceInfoService = new Service(peripheral, deviceInfoUUID);
    await expect(
      deviceInfoService.write(alertUUID, Buffer.from("message"))
    ).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using a converter name", async () => {
    const deviceInfoService = new Service(
      peripheral,
      deviceInfoUUID,
      converters
    );
    await expect(deviceInfoService.write("alert", "message")).resolves.toBe(
      undefined
    );
  }, 10000);

  it("writes a characteristic using its UUID without response", async () => {
    const deviceInfoService = new Service(peripheral, deviceInfoUUID);
    await expect(
      deviceInfoService.write(alertUUID, Buffer.from("message"), true)
    ).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using a converter name without response", async () => {
    const deviceInfoService = new Service(
      peripheral,
      deviceInfoUUID,
      converters
    );
    await expect(
      deviceInfoService.write("alert", "message", true)
    ).resolves.toBe(undefined);
  }, 10000);

  it("can listen to notifications using a UUID", async () => {
    // on(name, listener)
  }, 10000);

  it("can listen to notifications using a converter name", async () => {
    // on(name, listener)
  }, 10000);

  it("can stop listening to notifications using a UUID", async () => {
    // off(name, listener)
  }, 10000);

  it("can stop listening to notifications using a converter name", async () => {
    // off(name, listener)
  }, 10000);

  it("gets all avalable characteristics", async () => {
    // getCharacteristics()
  }, 10000);
});

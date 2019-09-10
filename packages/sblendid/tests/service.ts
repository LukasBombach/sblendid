import Service from "../src/service";
import Sblendid from "../src/sblendid";
import Peripheral from "../src/peripheral";
import { Converter } from "../src/characteristic";

describe("Service", () => {
  const name = "Find Me";
  const deviceInfoUUID = "180a";
  const manufacturerUUID = "2a29";

  let peripheral: Peripheral;
  let services: Service<any>[];

  let writableSUUID: SUUID;
  let writableCUUID: CUUID;
  let notifyableSUUID: SUUID;
  let notifyableCUUID: CUUID;
  let writeConverters: { message: Converter<string> };
  let notifyConverters: { message: Converter<string> };

  const converters = {
    manufacturer: {
      uuid: "2a29",
      decode: (buffer: Buffer) => buffer.toString()
    }
  };

  beforeAll(async () => {
    peripheral = await Sblendid.connect(name);
    // todo this needs to be done before services can be used directly
    // todo this must be done automatically by the service class
    services = await peripheral.getServices();
    // todo this is hands down the worst code I have ever seen
    while (writableSUUID === undefined && notifyableSUUID === undefined) {
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const { uuid, properties } of characteristics) {
          if (properties.write) {
            writableSUUID = service.uuid;
            writableCUUID = uuid;
          }
          if (properties.notify) {
            notifyableSUUID = service.uuid;
            notifyableCUUID = uuid;
          }
        }
      }
    }

    writeConverters = {
      message: {
        uuid: writableCUUID,
        decode: (buffer: Buffer) => buffer.toString(),
        encode: (message: string) => Buffer.from(message, "utf8")
      }
    };
    notifyConverters = {
      message: {
        uuid: notifyableCUUID,
        decode: (buffer: Buffer) => buffer.toString(),
        encode: (message: string) => Buffer.from(message, "utf8")
      }
    };
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
    const service = new Service(peripheral, writableSUUID);
    await expect(
      service.write(writableCUUID, Buffer.from("message"))
    ).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using a converter name", async () => {
    const service = new Service(peripheral, writableSUUID, writeConverters);
    await expect(service.write("message", "message")).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using its UUID without response", async () => {
    const service = new Service(peripheral, writableSUUID);
    await expect(
      service.write(writableCUUID, Buffer.from("message"), true)
    ).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using a converter name without response", async () => {
    const service = new Service(peripheral, writableSUUID, writeConverters);
    await expect(service.write("message", "message", true)).resolves.toBe(
      undefined
    );
  }, 10000);

  it("can listen to notifications using a UUID", async () => {
    const service = new Service(peripheral, notifyableSUUID);
    await expect(service.on(notifyableCUUID, () => {})).resolves.toBe(
      undefined
    );
  }, 10000);

  it("can listen to notifications using a converter name", async () => {
    const service = new Service(peripheral, notifyableSUUID, notifyConverters);
    await expect(service.on("message", () => {})).resolves.toBe(undefined);
  }, 10000);

  it("can stop listening to notifications using a UUID", async () => {
    const service = new Service(peripheral, notifyableSUUID);
    const listener = () => {};
    service.on(notifyableCUUID, listener);
    await expect(service.off(notifyableCUUID, listener)).resolves.toBe(
      undefined
    );
  }, 10000);

  it("can stop listening to notifications using a converter name", async () => {
    const service = new Service(peripheral, notifyableSUUID, notifyConverters);
    const listener = () => {};
    service.on("message", listener);
    await expect(service.off("message", listener)).resolves.toBe(undefined);
  }, 10000);

  it("gets all avalable characteristics", async () => {
    const service = new Service(peripheral, deviceInfoUUID);
    const characteristics = await service.getCharacteristics();
    expect(characteristics.map(c => c.uuid).sort()).toMatchSnapshot();
  }, 10000);

  it("gets all avalable characteristics using converers", async () => {
    const service = new Service(peripheral, deviceInfoUUID, converters);
    const characteristics = await service.getCharacteristics();
    expect(characteristics.map(c => c.uuid).sort()).toMatchSnapshot();
  }, 10000);
});

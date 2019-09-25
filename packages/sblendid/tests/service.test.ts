import Sblendid from "../src/sblendid";
import Peripheral from "../src/peripheral";
import Service from "../src/service";
import Characteristic, { Converter } from "../src/characteristic";

// jest.mock("@sblendid/adapter-node");

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
    expect(() => new Service(deviceInfoUUID, peripheral)).not.toThrow();
  }, 10000);

  it("can be instantiated with converters", async () => {
    expect(
      () => new Service(deviceInfoUUID, peripheral, { converters })
    ).not.toThrow();
  }, 10000);

  it.todo("invalidates converters with duplicate UUIDs");

  it("reads a characteristic using its UUID", async () => {
    const deviceInfoService = new Service(deviceInfoUUID, peripheral);
    const buffer = await deviceInfoService.read(manufacturerUUID);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toMatch(/.+/);
  }, 10000);

  it("reads a characteristic using a converter name", async () => {
    const deviceInfoService = new Service(deviceInfoUUID, peripheral, {
      converters
    });
    const value = await deviceInfoService.read("manufacturer");
    expect(typeof value).toBe("string");
    expect(value).toMatch(/.+/);
  }, 10000);

  it("writes a characteristic using its UUID", async () => {
    const service = new Service(writableSUUID, peripheral);
    await expect(
      service.write(writableCUUID, Buffer.from("message"))
    ).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using a converter name", async () => {
    const service = new Service(writableSUUID, peripheral, {
      converters: writeConverters
    });
    await expect(service.write("message", "message")).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using its UUID without response", async () => {
    const service = new Service(writableSUUID, peripheral);
    await expect(
      service.write(writableCUUID, Buffer.from("message"), true)
    ).resolves.toBe(undefined);
  }, 10000);

  it("writes a characteristic using a converter name without response", async () => {
    const service = new Service(writableSUUID, peripheral, {
      converters: writeConverters
    });
    await expect(service.write("message", "message", true)).resolves.toBe(
      undefined
    );
  }, 10000);

  it("can listen to notifications using a UUID", async () => {
    const service = new Service(notifyableSUUID, peripheral);
    await expect(service.on(notifyableCUUID, () => {})).resolves.toBe(
      undefined
    );
  }, 10000);

  it("can listen to notifications using a converter name", async () => {
    const service = new Service(notifyableSUUID, peripheral, {
      converters: notifyConverters
    });
    await expect(service.on("message", () => {})).resolves.toBe(undefined);
  }, 10000);

  it("can stop listening to notifications using a UUID", async () => {
    const service = new Service(notifyableSUUID, peripheral);
    const listener = () => {};
    await service.on(notifyableCUUID, listener);
    await expect(service.off(notifyableCUUID, listener)).resolves.toBe(
      undefined
    );
  }, 10000);

  it("can stop listening to notifications using a converter name", async () => {
    const service = new Service(notifyableSUUID, peripheral, {
      converters: notifyConverters
    });
    const listener = () => {};
    await service.on("message", listener);
    await expect(service.off("message", listener)).resolves.toBe(undefined);
  }, 10000);

  it("gets all avalable characteristics", async () => {
    const service = new Service(deviceInfoUUID, peripheral);
    const characteristics = await service.getCharacteristics();
    expect(characteristics.map(c => c.uuid).sort()).toMatchSnapshot();
  }, 10000);

  it("caches avalable characteristics", async () => {
    const service = new Service(deviceInfoUUID, peripheral);
    const spy = jest.spyOn(service.peripheral.adapter, "getCharacteristics");
    await service.getCharacteristics();
    await service.getCharacteristics();
    expect(spy).toHaveBeenCalledTimes(1);
  }, 10000);

  it("gets all avalable characteristics using converers", async () => {
    const service = new Service(deviceInfoUUID, peripheral, { converters });
    const characteristics = await service.getCharacteristics();
    expect(characteristics.map(c => c.uuid).sort()).toMatchSnapshot();
  }, 10000);

  it("gets a characteristic by a uuid that is a string", async () => {
    const service = new Service(deviceInfoUUID, peripheral);
    const characteristic = await service.getCharacteristic(manufacturerUUID);
    expect(characteristic).toBeInstanceOf(Characteristic);
    expect(characteristic.uuid).toBe(manufacturerUUID);
  }, 10000);

  it("gets a characteristic by a converter name", async () => {
    const service = new Service(deviceInfoUUID, peripheral, { converters });
    const characteristic = await service.getCharacteristic("manufacturer");
    expect(characteristic).toBeInstanceOf(Characteristic);
    expect(characteristic.uuid).toBe(manufacturerUUID);
  }, 10000);

  it("gets a characteristic by a uuid that is a number", async () => {
    const service = new Service(deviceInfoUUID, peripheral);
    const numberUUID = 9999;
    const characteristics = [new Characteristic(numberUUID, service)];
    service.getCharacteristics = jest
      .fn()
      .mockImplementation(() => Promise.resolve(characteristics));
    const characteristic = await service.getCharacteristic(numberUUID);
    expect(characteristic).toBe(characteristics[0]);
    expect(characteristic.uuid).toBe(numberUUID);
  }, 10000);

  it("gets a characteristic by UUID when a converter can't be found", async () => {
    const service = new Service(deviceInfoUUID, peripheral, { converters });
    const uuid = "2a02";
    const characteristics = [new Characteristic(uuid, service)];
    service.getCharacteristics = jest
      .fn()
      .mockImplementation(() => Promise.resolve(characteristics));
    const characteristic = await service.getCharacteristic(uuid as any);
    expect(characteristic).toBe(characteristics[0]);
    expect(characteristic.uuid).toBe(uuid);
  }, 10000);

  it("throws an error when trying to get an unknown characteristic", async () => {
    const service = new Service(deviceInfoUUID, peripheral);
    const name = "Definitely unknown characteristic UUID";
    const error = new Error(`Cannot find Characteristic for "${name}"`);
    await expect(service.getCharacteristic(name)).rejects.toEqual(error);
  }, 10000);

  it("throws an error when trying to get an unknown characteristic using converters", async () => {
    const uuid = "Definitely unknown characteristic UUID";
    const faultyConverter = { wrong: { uuid } };
    const error = new Error(`Cannot find Characteristic for "wrong"`);
    const service = new Service(deviceInfoUUID, peripheral, {
      converters: faultyConverter
    });
    await expect(service.getCharacteristic("wrong")).rejects.toEqual(error);
  }, 10000);
});

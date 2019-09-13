import Sblendid from "../src/sblendid";
import Peripheral from "../src/peripheral";
import Service from "../src/service";
import Characteristic, { Properties, Converter } from "../src/characteristic";

type ConstructorPerumtation = [
  Service<any>,
  string,
  Properties | undefined,
  Converter<any> | undefined
];

describe("Characteristic", () => {
  const name = "Find Me";
  const uuid = "2a29";
  const decode = (buffer: Buffer) => buffer.toString();
  const encode = (message: string) => Buffer.from(message, "utf8");
  const converter = { uuid, decode, encode };

  let peripheral: Peripheral;
  let services: Service<any>[];
  let deviceInfo: Service<any>;

  beforeAll(async () => {
    peripheral = await Sblendid.connect(name);
    services = await peripheral.getServices();
    deviceInfo = services.find(s => s.uuid === "180a")!;
    // todo again, this need to be done before this works, which is not cool
    await deviceInfo.getCharacteristics();
  }, 10000);

  afterAll(async () => {
    await peripheral.disconnect();
  });

  it("can be instantiated", async () => {
    const permutations: ConstructorPerumtation[] = [
      [deviceInfo, uuid, undefined, undefined],
      [deviceInfo, uuid, { read: true }, undefined],
      [deviceInfo, uuid, undefined, converter],
      [deviceInfo, uuid, { read: true }, converter]
    ];

    for (const [service, uuid, properties, converter] of permutations) {
      const options = { properties, converter };
      const characteristic = new Characteristic(uuid, service, options);
      expect(characteristic.uuid).toBe(uuid);
      expect(characteristic.service).toBe(service);
      expect(characteristic.properties).toEqual(properties || {});
      expect(characteristic["converter"]).toBe(converter);
    }
  });

  it("can read using a UUID", async () => {
    const characteristic = new Characteristic(uuid, deviceInfo);
    const buffer = await characteristic.read();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toMatch(/.+/);
  });

  it("can read using a converter", async () => {
    const characteristic = new Characteristic(uuid, deviceInfo, { converter });
    const value = await characteristic.read();
    expect(typeof value).toBe("string");
    expect(value.toString()).toMatch(/.+/);
  });

  it("can write using a UUID", async () => {
    const characteristic = new Characteristic(uuid, deviceInfo);
    await expect(characteristic.write(Buffer.from("message"))).resolves.toBe(
      undefined
    );
  });

  it("can write using a converter", async () => {
    const characteristic = new Characteristic(uuid, deviceInfo, { converter });
    await expect(characteristic.write("message")).resolves.toBe(undefined);
  });

  it("throws an error when writing using a converter without an encode fn", async () => {
    const converter = { uuid, decode };
    const characteristic = new Characteristic(uuid, deviceInfo, { converter });
    const error = new Error(
      "Cannot write using a converter without an encode method"
    );
    await expect(characteristic.write("message")).rejects.toEqual(error);
  });

  it("can notify using a UUID", async () => {
    const characteristic = new Characteristic(uuid, deviceInfo);
    await expect(characteristic.on("notify", () => {})).resolves.toBe(
      undefined
    );
  });
  it("can notify using a converter", async () => {
    const characteristic = new Characteristic(uuid, deviceInfo, { converter });
    await expect(characteristic.on("notify", () => {})).resolves.toBe(
      undefined
    );
  });

  it.todo("can stop notifying using a UUID");
  it.todo("can stop notifying using a converter");
});

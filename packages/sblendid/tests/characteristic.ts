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
  const converter = { uuid, decode };

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
      const [s, u, p, c] = [service, uuid, properties, converter];
      const characteristic = new Characteristic(s, u, p, c);
      expect(characteristic.uuid).toBe(uuid);
      expect(characteristic.service).toBe(service);
      expect(characteristic.properties).toEqual(properties || {});
      expect(characteristic["converter"]).toBe(converter);
    }
  });

  it("can read using a UUID", async () => {
    const characteristic = new Characteristic(deviceInfo, uuid);
    const buffer = await characteristic.read();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toMatch(/.+/);
  });

  it("can read using a converter", async () => {
    const characteristic = new Characteristic(
      deviceInfo,
      uuid,
      undefined,
      converter
    );
    const value = await characteristic.read();
    expect(typeof value).toBe("string");
    expect(value.toString()).toMatch(/.+/);
  });

  it.todo("can write using a UUID");
  it.todo("can write using a converter");
  it.todo("can notify using a UUID");
  it.todo("can notify using a converter");
  it.todo("can stop notifying using a UUID");
  it.todo("can stop notifying using a converter");
});

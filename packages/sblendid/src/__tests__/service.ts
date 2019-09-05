import Service from "../service";
import Sblendid from "../sblendid";
import Peripheral from "../peripheral";

describe("Service", () => {
  const name = "Find Me";
  const deviceInfoUUID = "180a";
  let peripheral: Peripheral;
  const deviceInfoConverters = [
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

  beforeAll(async () => {
    peripheral = await Sblendid.connect(name);
  }, 10000);

  afterAll(async () => {
    await peripheral.disconnect();
  });

  it("can be instantiated without converters", async () => {
    expect(() => new Service(peripheral, deviceInfoUUID)).not.toThrow();
  }, 10000);

  it("can be instantiated with converters", async () => {
    expect(
      () => new Service(peripheral, deviceInfoUUID, deviceInfoConverters)
    ).not.toThrow();
  }, 10000);

  it("invalidates converters", async () => {
    const faulyConverters = [...deviceInfoConverters, deviceInfoConverters[0]];
    expect(
      () => new Service(peripheral, deviceInfoUUID, faulyConverters)
    ).toThrow("Duplicate UUIDs");
  }, 10000);

  it("reads a characteristic using its UUID", async () => {
    // read(name)
  }, 10000);

  it("reads a characteristic using a converter name", async () => {
    // read(name)
  }, 10000);

  it("writes a characteristic using its UUID", async () => {
    // write( name, value )
  }, 10000);

  it("writes a characteristic using a converter name", async () => {
    // write( name, value )
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

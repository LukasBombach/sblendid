import { Params } from "@sblendid/adapter-node";
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
  const peripheralName = "Find Me";

  let peripheral: Peripheral;
  let services: Service<any>[];
  let deviceInfo: Service<any>;
  let timeService: Service<any>;

  const manufacturer = {
    uuid: "2a29",
    decode: (buffer: Buffer) => buffer.toString(),
    encode: (message: string) => Buffer.from(message, "utf8")
  };

  const time = {
    uuid: "2a2b",
    decode: (buffer: Buffer) => buffer.toString()
  };

  function readParamsTime(data: Buffer, notify: boolean): Params<"read"> {
    return [peripheral.uuid, timeService.uuid, time.uuid, data, notify];
  }

  beforeAll(async () => {
    peripheral = await Sblendid.connect(peripheralName);
    services = await peripheral.getServices();
    deviceInfo = services.find(s => s.uuid === "180a")!;
    timeService = services.find(s => s.uuid === "1805")!;
    await deviceInfo.getCharacteristics();
    await timeService.getCharacteristics();
  }, 10000);

  afterAll(async () => {
    await peripheral.disconnect();
  });

  it("can be instantiated", async () => {
    const permutations: ConstructorPerumtation[] = [
      [deviceInfo, manufacturer.uuid, undefined, undefined],
      [deviceInfo, manufacturer.uuid, { read: true }, undefined],
      [deviceInfo, manufacturer.uuid, undefined, manufacturer],
      [deviceInfo, manufacturer.uuid, { read: true }, manufacturer]
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
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo);
    const buffer = await characteristic.read();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.toString()).toMatch(/.+/);
  });

  it("can read using a converter", async () => {
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo, {
      converter: manufacturer
    });
    const value = await characteristic.read();
    expect(typeof value).toBe("string");
    expect(value.toString()).toMatch(/.+/);
  });

  it("throws an error when reading using a converter without a decode fn", async () => {
    const { uuid, encode } = manufacturer;
    const converter = { uuid, encode };
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo, {
      converter
    });
    const error = new Error(
      "Cannot read using a converter without a decode method"
    );
    await expect(characteristic.read()).rejects.toEqual(error);
  });

  it("can write using a UUID", async () => {
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo);
    await expect(characteristic.write(Buffer.from("message"))).resolves.toBe(
      undefined
    );
  });

  it("can write using a converter", async () => {
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo, {
      converter: manufacturer
    });
    await expect(characteristic.write("message")).resolves.toBe(undefined);
  });

  it("throws an error when writing using a converter without an encode fn", async () => {
    const { uuid, decode } = manufacturer;
    const converter = { uuid, decode };
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo, {
      converter
    });
    const error = new Error(
      "Cannot write using a converter without an encode method"
    );
    await expect(characteristic.write("message")).rejects.toEqual(error);
  });

  it("can notify using a UUID", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    await expect(characteristic.on("notify", () => {})).resolves.toBe(
      undefined
    );
  });

  it("can notify using a converter", async () => {
    const characteristic = new Characteristic(time.uuid, timeService, {
      converter: time
    });
    await expect(characteristic.on("notify", () => {})).resolves.toBe(
      undefined
    );
  });

  it("emits a notify event", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    const { bindings } = characteristic.service.peripheral.adapter["bindings"];
    const listener = jest.fn();
    const data = Buffer.from("message", "utf8");
    const params = readParamsTime(data, true);
    await characteristic.on("notify", listener);
    bindings.emit("read", ...params);
    await new Promise(setImmediate);
    expect(listener).toHaveBeenCalledWith(data);
  });

  it("emits a notify event using a converter", async () => {
    const characteristic = new Characteristic(time.uuid, timeService, {
      converter: time
    });
    const { bindings } = characteristic.service.peripheral.adapter["bindings"];
    const listener = jest.fn();
    const message = "message";
    const data = Buffer.from(message, "utf8");
    const params = readParamsTime(data, true);
    await characteristic.on("notify", listener);
    bindings.emit("read", ...params);
    await new Promise(setImmediate);
    expect(listener).toHaveBeenCalledWith(message);
  });

  it("emit ignores non-this-characteristic read events", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    const { bindings } = characteristic.service.peripheral.adapter["bindings"];
    const listener = jest.fn();
    const data = Buffer.from("message", "utf8");
    const params = readParamsTime(data, true);
    params[2] = "something else";
    await characteristic.on("notify", listener);
    bindings.emit("read", ...params);
    await new Promise(setImmediate);
    expect(listener).not.toHaveBeenCalled();
  });

  it("emit ignores non-notify read events", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    const { bindings } = characteristic.service.peripheral.adapter["bindings"];
    const listener = jest.fn();
    const data = Buffer.from("message", "utf8");
    const params = readParamsTime(data, false);
    await characteristic.on("notify", listener);
    bindings.emit("read", ...params);
    await new Promise(setImmediate);
    expect(listener).not.toHaveBeenCalled();
  });

  it("can stop notifying using a UUID", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    const { bindings } = characteristic.service.peripheral.adapter["bindings"];
    const listener = jest.fn();
    const data = Buffer.from("message", "utf8");
    const params = readParamsTime(data, true);
    await characteristic.on("notify", listener);
    listener.mockClear();
    await characteristic.off("notify", listener);
    bindings.emit("read", ...params);
    await new Promise(setImmediate);
    expect(listener).not.toHaveBeenCalled();
  });

  it("can stop notifying using a converter", async () => {
    const characteristic = new Characteristic(time.uuid, timeService, {
      converter: manufacturer
    });
    const { bindings } = characteristic.service.peripheral.adapter["bindings"];
    const listener = jest.fn();
    const message = "message";
    const data = Buffer.from(message, "utf8");
    const params = readParamsTime(data, true);
    await characteristic.on("notify", listener);
    await characteristic.off("notify", listener);
    bindings.emit("read", ...params);
    await new Promise(setImmediate);
    expect(listener).not.toHaveBeenCalledWith(message);
  });

  it("starts notifications only once", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    const spy = jest.spyOn(characteristic.service.peripheral.adapter, "notify");
    const listener = jest.fn();
    const listener2 = jest.fn();
    await characteristic.on("notify", listener);
    await characteristic.on("notify", listener2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not stop notifications when there are still active listeners", async () => {
    const characteristic = new Characteristic(time.uuid, timeService);
    const spy = jest.spyOn(characteristic.service.peripheral.adapter, "notify");
    const listener = jest.fn();
    const listener2 = jest.fn();
    await characteristic.on("notify", listener);
    await characteristic.on("notify", listener2);
    spy.mockClear();
    await characteristic.off("notify", listener);
    await characteristic.off("notify", listener2);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("throws when listening for notifications on a non-notifiable characteristic", async () => {
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo);
    const listener = jest.fn();
    const message = `Failed to turn on notifications for ${manufacturer.uuid}`;
    const error = new Error(message);
    await expect(characteristic.on("notify", listener)).rejects.toEqual(error);
  });

  it("throws when stopping to listen for notifications on a non-notifiable characteristic", async () => {
    const characteristic = new Characteristic(manufacturer.uuid, deviceInfo);
    jest
      .spyOn(characteristic.service.peripheral.adapter, "notify")
      .mockImplementationOnce(() => Promise.resolve(true));
    const listener = jest.fn();
    const message = `Failed to turn off notifications for ${manufacturer.uuid}`;
    const error = new Error(message);
    await expect(characteristic.off("notify", listener)).rejects.toEqual(error);
  });
});

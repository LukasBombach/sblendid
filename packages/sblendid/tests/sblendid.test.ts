import { inspect } from "util";
import Adapter from "@sblendid/adapter-node";
import Sblendid, { Peripheral } from "../src";

describe("Sblendid", () => {
  const name = "Find Me";
  const max = 5;

  it("can power on the adapter using its static method", async () => {
    const spy = jest.spyOn(Adapter.prototype, "powerOn");
    const sblendid = await Sblendid.powerOn();
    expect(sblendid).toBeInstanceOf(Sblendid);
    expect(spy).toHaveBeenCalledWith();
  }, 10000);

  it("waits for the adapter to have been powered on", async () => {
    const spy = jest.spyOn(Adapter.prototype, "powerOn");
    await Sblendid.powerOn();
    const spyReturn = spy.mock.results[0].value;
    expect(inspect(spyReturn)).toBe("Promise { undefined }");
  }, 10000);

  it.each`
    how                           | condition
    ${"by name"}                  | ${name}
    ${"using a condition"}        | ${(p: Peripheral) => !!p.connectable}
    ${"using an async condition"} | ${(p: Peripheral) => new Promise(res => res(!!p.connectable))}
  `(
    "can connect to a peripheral $how",
    async ({ condition }) => {
      const spy = jest.spyOn(Adapter.prototype, "find");
      const peripheral = await Sblendid.connect(condition);
      const findCondition = spy.mock.calls[0][spy.mock.calls[0].length - 1];
      const adv = { localName: "Find Me" };
      const result = findCondition("uuid", "address", "public", true, adv, 1);
      expect(peripheral).toBeInstanceOf(Peripheral);
      expect(peripheral.isConnected()).toBe(true);
      expect(spy).toHaveBeenCalledWith(expect.any(Function));
      expect(result).toBe(true);
      await peripheral.disconnect();
    },
    10000
  );

  it.skip("can power on the adapter using its instance method", async () => {
    const sblendid = new Sblendid();
    await expect(sblendid.powerOn()).resolves.toBe(undefined);
  }, 10000);

  it.skip("can find the first connectable peripheral", async () => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(p => Boolean(p.connectable));
    expect(peripheral).toBeInstanceOf(Peripheral);
  }, 10000);

  it.skip("can find a peripheral by name", async () => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(name);
    expect(peripheral).toBeInstanceOf(Peripheral);
  }, 10000);

  it.skip("can find a peripheral with an async find function", async () => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(
      p => new Promise(res => (p.connectable ? res(true) : res(false)))
    );
    expect(peripheral).toBeInstanceOf(Peripheral);
  }, 10000);

  it.skip("can start scanning without a callback", async () => {
    const sblendid = await Sblendid.powerOn();
    expect(() => sblendid.startScanning()).not.toThrow();
    sblendid.stopScanning();
  }, 10000);

  it.skip(`can scan for ${max} peripherals`, async () => {
    expect.assertions(1);
    let numFound = 0;
    const sblendid = await Sblendid.powerOn();
    const helper = (resolve: Function) => () => ++numFound >= max && resolve();
    await new Promise(resolve => sblendid.startScanning(helper(resolve)));
    expect(numFound).toBe(max);
    sblendid.stopScanning();
  }, 10000);

  it.skip("stops scaning for peripherals", async () => {
    expect.assertions(2);
    let numFound = 0;
    const sblendid = await Sblendid.powerOn();
    const helper = (resolve: Function) => () => ++numFound >= max && resolve();
    await new Promise(resolve => sblendid.startScanning(helper(resolve)));
    expect(numFound).toBe(max);
    sblendid.stopScanning();
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(numFound).toBe(max);
  }, 10000);
});

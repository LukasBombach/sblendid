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
    const spy = jest
      .spyOn(Adapter.prototype, "powerOn")
      .mockImplementation(() => new Promise<void>(res => setTimeout(res, 0)));
    await Sblendid.powerOn();
    const spyPromise = spy.mock.results[0].value;
    expect(inspect(spyPromise)).toBe("Promise { undefined }");
    spy.mockRestore();
  }, 10000);

  it("can connect to a peripheral using a condition", async () => {
    const spy = jest.spyOn(Adapter.prototype, "find");
    const peripheral = await Sblendid.connect(p => Boolean(p.connectable));
    const findCondition = spy.mock.calls[0][0];
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(true);
    expect(spy).toHaveBeenCalledWith(expect.any(Function));
    expect(findCondition("uuid", "address", "public", true, {}, 1)).toBe(true);
    await peripheral.disconnect();
  }, 10000);

  it("can connect to a peripheral by name", async () => {
    const peripheral = await Sblendid.connect(name);
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(true);
    await peripheral.disconnect();
  }, 10000);

  it.skip("can connect to a peripheral using an async condition", async () => {
    const peripheral = await Sblendid.connect(
      p => new Promise(res => (p.connectable ? res(true) : res(false)))
    );
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(true);
    await peripheral.disconnect();
  }, 10000);

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

import { inspect } from "util";
import Adapter from "@sblendid/adapter-node";
import Sblendid, { Peripheral, Condition } from "../src";

describe("Sblendid", () => {
  const name = "Find Me";
  const max = 5;
  const conditions: [string, Condition][] = [
    ["by name", name],
    ["using a callback", p => !!p.connectable],
    ["using an async callback", p => new Promise(res => res(!!p.connectable))]
  ];

  it("powers on the adapter using its static method", async () => {
    const spy = jest.spyOn(Adapter.prototype, "powerOn");
    const sblendid = await Sblendid.powerOn();
    expect(sblendid).toBeInstanceOf(Sblendid);
    expect(spy).toHaveBeenCalledWith();
  });

  it("waits for the adapter to have been powered on", async () => {
    const spy = jest.spyOn(Adapter.prototype, "powerOn");
    await Sblendid.powerOn();
    const spyReturn = spy.mock.results[0].value;
    expect(inspect(spyReturn)).toBe("Promise { undefined }");
  });

  it.each(conditions)("connects to a peripheral %s", async (_, condition) => {
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
  });

  it.each(conditions)("finds a peripheral %s", async (_, condition) => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(condition);
    expect(peripheral).toBeInstanceOf(Peripheral);
  });

  it.skip("starts scanning without a callback", async () => {
    const sblendid = await Sblendid.powerOn();
    expect(() => sblendid.startScanning()).not.toThrow();
    sblendid.stopScanning();
  });

  it.skip(`scans for ${max} peripherals`, async () => {
    expect.assertions(1);
    let numFound = 0;
    const sblendid = await Sblendid.powerOn();
    const helper = (resolve: Function) => () => ++numFound >= max && resolve();
    await new Promise(resolve => sblendid.startScanning(helper(resolve)));
    expect(numFound).toBe(max);
    sblendid.stopScanning();
  });

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
  });
});

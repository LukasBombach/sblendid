import { inspect } from "util";
import Adapter from "@sblendid/adapter-node";
import Sblendid, { Peripheral, Condition } from "../src";

describe("Sblendid", () => {
  const name = "Find Me";
  const scanTimeout = 300;
  const conditions: [string, Condition][] = [
    ["by name", name],
    ["using a callback", p => !!p.connectable],
    ["using an async callback", p => new Promise(res => res(!!p.connectable))]
  ];

  it("powers on the adapter using its static method", async () => {
    const spy = jest.spyOn(Adapter, "powerOn");
    const sblendid = await Sblendid.powerOn();
    expect(sblendid).toBeInstanceOf(Sblendid);
    expect(spy).toHaveBeenCalledWith();
  });

  it("waits for the adapter to have been powered on", async () => {
    const spy = jest.spyOn(Adapter, "powerOn");
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
    const spy = jest.spyOn(Adapter.prototype, "find");
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(condition);
    const findCondition = spy.mock.calls[0][spy.mock.calls[0].length - 1];
    const adv = { localName: "Find Me" };
    const result = findCondition("uuid", "address", "public", true, adv, 1);
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(false);
    expect(spy).toHaveBeenCalledWith(expect.any(Function));
    expect(result).toBe(true);
  });

  it("will receive a peripheral in the connect / find conditions", async () => {
    const sblendid = await Sblendid.powerOn();
    const condition = jest.fn((p: Peripheral) => p.name === name);
    await sblendid.find(condition);
    const peripheral = await Sblendid.connect(condition);
    expect(condition).nthCalledWith(1, expect.any(Peripheral));
    expect(condition).nthCalledWith(2, expect.any(Peripheral));
    await peripheral.disconnect();
  });

  it("starts scanning without a callback", async () => {
    const spy = jest.spyOn(Adapter.prototype, "on");
    const sblendid = await Sblendid.powerOn();
    expect(() => sblendid.startScanning()).not.toThrow();
    expect(spy).toHaveBeenLastCalledWith("discover", expect.any(Function));
    sblendid.stopScanning();
  });

  it("will receive a peripheral in the scan callback", async () => {
    const sblendid = await Sblendid.powerOn();
    const spy = jest.fn();
    sblendid.startScanning(spy);
    await new Promise(resolve => setTimeout(resolve, scanTimeout));
    sblendid.stopScanning();
    expect(spy).toHaveBeenLastCalledWith(expect.any(Peripheral));
  });

  it(`scans for 3 peripherals`, async () => {
    const sblendid = await Sblendid.powerOn();
    const maxCalls = (start = 0) => {
      const cb = (res: Function) => () => ++start >= 3 && res(start);
      return new Promise(res => sblendid.startScanning(cb(res)));
    };
    await expect(maxCalls()).resolves.toBe(3);
  });

  it(`stops scanning for peripherals`, async () => {
    const sblendid = await Sblendid.powerOn();
    const spy = jest.fn();
    sblendid.startScanning(spy);
    await new Promise(res => setTimeout(res, scanTimeout));
    sblendid.stopScanning();
    expect(spy).toHaveBeenCalled();
    spy.mockReset();
    await new Promise(res => setTimeout(res, scanTimeout));
    expect(spy).not.toHaveBeenCalled();
  });
});

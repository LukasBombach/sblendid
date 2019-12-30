import Adapter from "../src/index";

import "./matchers/schema";
import "./matchers/events";

describe("Sblendid Node Adapter", () => {
  it("turns on the BLE adapter", async () => {
    await expect(Adapter.powerOn()).resolves.toBe(undefined);
    await Adapter.powerOff();
  });

  it("turns off the BLE adapter", async () => {
    await Adapter.powerOn();
    await expect(Adapter.powerOff()).resolves.toBe(undefined);
  });

  it("doesn't crash when initialized multiple times", async () => {
    await expect(
      Promise.all([Adapter.powerOn(), Adapter.powerOn()])
    ).resolves.toEqual([undefined, undefined]);
    await Adapter.powerOff();
  });

  it("doesn't crash when stopped multiple times", async () => {
    await Adapter.powerOn();
    await expect(
      Promise.all([Adapter.powerOff(), Adapter.powerOff()])
    ).resolves.toEqual([undefined, undefined]);
  });
});

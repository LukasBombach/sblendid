import NodeAdapter from "../src/index";

import "./matchers/schema";
import "./matchers/events";

describe("Sblendid Node Adapter", () => {
  it("turns on the BLE adapter", async () => {
    const adapter = new NodeAdapter();
    await expect(adapter.powerOn()).resolves.toBe(undefined);
    await adapter.powerOff();
  });

  it("turns off the BLE adapter", async () => {
    const adapter = new NodeAdapter();
    await adapter.powerOn();
    await expect(adapter.powerOff()).resolves.toBe(undefined);
  });

  it("doesn't crash when initialized multiple times", async () => {
    const adapter = new NodeAdapter();
    await expect(
      Promise.all([adapter.powerOn(), adapter.powerOn()])
    ).resolves.toEqual([undefined, undefined]);
    await adapter.powerOff();
  });

  it("doesn't crash when stopped multiple times", async () => {
    const adapter = new NodeAdapter();
    await adapter.powerOn();
    await expect(
      Promise.all([adapter.powerOff(), adapter.powerOff()])
    ).resolves.toEqual([undefined, undefined]);
  });
});

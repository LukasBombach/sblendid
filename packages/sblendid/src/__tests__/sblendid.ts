import Sblendid from "../sblendid";
import Peripheral from "../peripheral";

const setup = {
  name: "DE1",
  service: "180a",
  numScanPeripherals: 5
};

describe("Sblendid", () => {
  it("can power on the adapter using its static method", async () => {
    await expect(Sblendid.powerOn()).resolves.toBeInstanceOf(Sblendid);
  }, 10000);

  it("can connect to the first connectable peripheral", async () => {
    const peripheral = await Sblendid.connect(p => Boolean(p.connectable));
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(true);
    await peripheral.disconnect();
  }, 10000);

  it("can connect to a peripheral by name", async () => {
    const peripheral = await Sblendid.connect(setup.name);
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(true);
    await peripheral.disconnect();
  }, 10000);

  it("can connect to a peripheral with an async find function", async () => {
    const peripheral = await Sblendid.connect(
      p => new Promise(res => (p.connectable ? res(true) : res(false)))
    );
    expect(peripheral).toBeInstanceOf(Peripheral);
    expect(peripheral.isConnected()).toBe(true);
    await peripheral.disconnect();
  }, 10000);

  it("can power on the adapter using its instance method", async () => {
    const sblendid = new Sblendid();
    await expect(sblendid.powerOn()).resolves.toBe(undefined);
  }, 10000);

  it("can find the first connectable peripheral", async () => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(p => Boolean(p.connectable));
    expect(peripheral).toBeInstanceOf(Peripheral);
  }, 10000);

  it("can find a peripheral by name", async () => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(setup.name);
    expect(peripheral).toBeInstanceOf(Peripheral);
  }, 10000);

  it("can find a peripheral with an async find function", async () => {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(
      p => new Promise(res => (p.connectable ? res(true) : res(false)))
    );
    expect(peripheral).toBeInstanceOf(Peripheral);
  }, 10000);

  it(`can scan for ${setup.numScanPeripherals} peripherals`, async () => {
    const sblendid = await Sblendid.powerOn();
    let peripheralsFound = 0;
    expect.assertions(1);
    await new Promise(resolve => {
      sblendid.startScanning(() => {
        if (++peripheralsFound >= setup.numScanPeripherals) resolve();
      });
    });
    expect(peripheralsFound).toBe(setup.numScanPeripherals);
    sblendid.stopScanning();
  }, 10000);

  it("stops scaning for peripherals", async () => {
    const sblendid = await Sblendid.powerOn();
    let peripheralsFound = 0;
    expect.assertions(2);
    await new Promise(resolve => {
      sblendid.startScanning(() => {
        if (++peripheralsFound >= setup.numScanPeripherals) resolve();
      });
    });
    expect(peripheralsFound).toBe(setup.numScanPeripherals);
    sblendid.stopScanning();
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(peripheralsFound).toBe(setup.numScanPeripherals);
  }, 10000);
});

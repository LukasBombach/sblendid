import Sblendid from "../sblendid";
import timeout from "p-timeout";

const setup = {
  name: "DE1",
  service: "180a"
};

describe("Sblendid E2E tests", () => {
  it("can power on the adapter using its static method", async () => {
    await Sblendid.powerOn();
  }, 20000);

  it("can connect to the first connectable peripheral", async () => {
    const peripheral = await Sblendid.connect(p => Boolean(p.connectable));
    await peripheral.disconnect();
  }, 20000);

  it("can connect to a peripheral by name", async () => {
    const peripheral = await Sblendid.connect(setup.name);
    await peripheral.disconnect();
  }, 20000);

  it("can connect to a peripheral with an async find function", async () => {
    const peripheral = await Sblendid.connect(p =>
      timeout(p.hasService(setup.service), 2000, () => false)
    );
    await peripheral.disconnect();
  }, 20000);

  it("can power on the adapter using its static method", async () => {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
  }, 20000);

  it("can find the first connectable peripheral", async () => {
    const sblendid = await Sblendid.powerOn();
    await sblendid.find(p => Boolean(p.connectable));
  }, 20000);

  it("can find a peripheral by name", async () => {
    const sblendid = await Sblendid.powerOn();
    await sblendid.find(setup.name);
  }, 20000);

  it("can find a peripheral with an async find function", async () => {
    const sblendid = await Sblendid.powerOn();
    await sblendid.find(p =>
      timeout(p.hasService(setup.service), 2000, () => false)
    );
  }, 20000);

  it("can stat and stop scanning for peripherals", async () => {
    const sblendid = await Sblendid.powerOn();
    sblendid.startScanning();
    await new Promise(resolve => setTimeout(resolve, 500));
    sblendid.stopScanning();
  }, 20000);

  it("can scan for peripherals", done => {
    Sblendid.powerOn().then(sblendid => {
      let peripheralsFound = 0;
      sblendid.startScanning(() => {
        if (++peripheralsFound < 10) return;
        sblendid.stopScanning();
        done();
      });
    });
  }, 20000);
});

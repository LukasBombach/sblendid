import Sblendid from "../sblendid";
import timeout from "p-timeout";

const setup = {
  name: "DE1",
  service: "180a"
};

describe("Sblendid E2E tests", () => {
  it("can power on the adapter using its static method", async () => {
    await Sblendid.powerOn();
  });

  it("can connect to the first connectable peripheral", async () => {
    await Sblendid.connect(p => Boolean(p.connectable));
  });

  it("can connect to a peripheral by name", async () => {
    await Sblendid.connect(setup.name);
  });

  it("can connect to a peripheral with an async find function", async () => {
    await Sblendid.connect(p =>
      timeout(p.hasService(setup.service), 2000, () => false)
    );
  });

  it("can power on the adapter using its static method", async () => {
    const sblendid = new Sblendid();
    await sblendid.powerOn();
  });

  it("can find the first connectable peripheral", async () => {
    const sblendid = new Sblendid();
    await sblendid.find(p => Boolean(p.connectable));
  });

  it("can find a peripheral by name", async () => {
    const sblendid = new Sblendid();
    await sblendid.find(setup.name);
  });

  it("can find a peripheral with an async find function", async () => {
    const sblendid = new Sblendid();
    await sblendid.find(p =>
      timeout(p.hasService(setup.service), 2000, () => false)
    );
  });

  it("can stat and stop scanning for peripherals", async () => {
    const sblendid = new Sblendid();
    sblendid.startScanning();
    await new Promise(resolve => setTimeout(resolve, 500));
    sblendid.stopScanning();
  });

  it("can scan for peripherals", done => {
    let peripheralsFound = 0;
    const sblendid = new Sblendid();
    sblendid.startScanning(() => {
      if (++peripheralsFound < 10) return;
      sblendid.stopScanning();
      done();
    });
  });
});

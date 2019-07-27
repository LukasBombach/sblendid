import Sblendid from "../src";
import logAll from "./logAll";

const converters = [
  {
    uuid: "2a29",
    name: "manufacturer",
    decode: (buffer: Buffer) => buffer.toString()
  },
  {
    uuid: "2a24",
    name: "model",
    decode: (buffer: Buffer) => buffer.toString()
  }
];

(async () => {
  try {
    const peripheral = await Sblendid.connect(p => {
      console.log(".");
      return p.hasService("180a").catch(() => false);
    });

    const deviceInfo = await peripheral.getService("180a", converters);

    console.log("Manufacturer:", await deviceInfo.read("manufacturer"));
    console.log("Model:", await deviceInfo.read("model"));

    process.exit();
  } catch (error) {
    console.error(error);
  }
})();

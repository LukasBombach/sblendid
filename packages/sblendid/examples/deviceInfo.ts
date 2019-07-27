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
    const peripheral = await Sblendid.connect(async p => {
      console.log(".");
      if (
        !p.advertisement.manufacturerData ||
        !p.advertisement.manufacturerData.toString("hex").startsWith("4c00")
      )
        return false;
      return await Promise.race<boolean>([
        p.hasService("180a"),
        new Promise<boolean>(res => setTimeout(() => res(false), 2000))
      ]);
    });

    const label =
      peripheral.advertisement.manufacturerData &&
      peripheral.advertisement.manufacturerData.toString("hex");
    console.log("Found", label);

    const deviceInfo = await peripheral.getService("180a", converters);

    console.log("Manufacturer:", await deviceInfo.read("manufacturer"));
    console.log("Model:", await deviceInfo.read("model"));

    process.exit();
  } catch (error) {
    console.error(error);
  }
})();

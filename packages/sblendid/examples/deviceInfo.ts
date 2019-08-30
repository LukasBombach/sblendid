import Sblendid from "../src";
import timeout from "p-timeout";

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
  const peripheral = await Sblendid.connect(p =>
    timeout(p.hasService("180a"), 2000, () => false)
  );

  const deviceInfo = await peripheral.getService("180a", converters);

  console.log("Manufacturer:", await deviceInfo!.read("manufacturer"));
  console.log("Model:", await deviceInfo!.read("model"));

  peripheral.disconnect();
  process.exit();
})();

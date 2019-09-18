import Sblendid from "../src";

const converters = {
  manufacturer: {
    uuid: "2a29",
    decode: (buffer: Buffer) => buffer.toString()
  },
  model: {
    uuid: "2a24",
    decode: (buffer: Buffer) => buffer.toString()
  }
};

(async () => {
  const peripheral = await Sblendid.connect(p => p.hasService("180a"));
  const deviceInfo = await peripheral.getService("180a", converters);

  const manufacturer = await deviceInfo!.read("manufacturer");
  const model = await deviceInfo!.read("model");

  console.log("Manufacturer:", manufacturer);
  console.log("Model:", model);

  await peripheral.disconnect();
  process.exit();
})();

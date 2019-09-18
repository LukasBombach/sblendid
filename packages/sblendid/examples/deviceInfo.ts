import Sblendid, { Peripheral } from "../src";

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

async function hasDeviceInfoService(peripheral: Peripheral) {
  if (!peripheral.connectable) return false;
  await peripheral.connect();
  const hasDeviceInfoService = await peripheral.hasService("180a");
  await peripheral.disconnect();
  return hasDeviceInfoService;
}

(async () => {
  const peripheral = await Sblendid.connect(hasDeviceInfoService);
  const deviceInfo = await peripheral.getService("180a", converters);

  const manufacturer = await deviceInfo!.read("manufacturer");
  const model = await deviceInfo!.read("model");

  console.log("Manufacturer:", manufacturer);
  console.log("Model:", model);

  await peripheral.disconnect();
  process.exit();
})();

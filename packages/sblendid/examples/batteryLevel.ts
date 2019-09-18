import Sblendid, { Peripheral } from "../src";

async function hasBatteryService(peripheral: Peripheral) {
  if (!peripheral.connectable) return false;
  await peripheral.connect();
  const hasDeviceInfoService = await peripheral.hasService("180f");
  await peripheral.disconnect();
  return hasDeviceInfoService;
}

(async () => {
  const peripheral = await Sblendid.connect(hasBatteryService);

  const batteryService = await peripheral.getService("180f");
  const batteryLevel = await batteryService!.read("2a19");

  console.log("Battery Level", batteryLevel.readUInt8(0), "%");
})();

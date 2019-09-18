import Sblendid from "../src";

(async () => {
  const peripheral = await Sblendid.connect(p => p.hasService("180f"));

  const batteryService = await peripheral.getService("180f");
  const batteryLevel = await batteryService!.read("2a19");

  console.log("Battery Level", batteryLevel.readUInt8(0), "%");
})();

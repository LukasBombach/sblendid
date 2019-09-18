import Sblendid, { Peripheral } from "../src";

function hasEchoService(peripheral: Peripheral) {
  const { serviceUUIDs } = peripheral.advertisement;
  return !!serviceUUIDs && serviceUUIDs.includes("ec00");
}

(async () => {
  const peripheral = await Sblendid.connect(hasEchoService);
  const echoService = await peripheral.getService("ec00");
  let count = 0;

  echoService!.on("ec0e", async (data: Buffer) => {
    console.log("Got Echo", data.toString());
  });

  setInterval(async () => {
    const message = new Buffer(`Hello, BLE ${++count}`, "utf8");
    await echoService!.write("ec0e", message);
  }, 2500);
})();

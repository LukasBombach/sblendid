import Sblendid from "../src";

(async () => {
  const peripheral = await Sblendid.connect(p => p.hasService("ec00"));
  const echoService = await peripheral.getService("ec00");
  let count = 0;

  echoService!.on("ec0e", async data => {
    console.log("Got Echo", data.toString());
  });

  setInterval(async () => {
    const message = new Buffer(`Hello, BLE ${++count}`, "utf8");
    await echoService!.write("ec0e", message);
  }, 2500);
})();

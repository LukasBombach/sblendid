import Sblendid from "./src";

(async () => {
  const sblendid = new Sblendid();

  console.log("Powering on...");
  await sblendid.powerOn();
  console.log("Powered on!");

  console.log("Startings to scan...");
  sblendid.startScanning(peripheral => {
    console.log("Found Peripheral");
    console.log(peripheral);
  });
})();

const Sblendid = require("sblendid");

const sblendid = new Sblendid();

sblendid.startScanning(peripheral => {
  console.log(peripheral);
});

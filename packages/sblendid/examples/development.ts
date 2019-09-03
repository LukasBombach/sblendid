import Sblendid from "../src";

// EE215A96-AE34-433F-8711-11F0E911823A

(async () => {
  try {
    const sblendid = await Sblendid.powerOn();
    const peripheral = await sblendid.find(p => /EE215A96/i.test(p.uuid));
    console.log(peripheral);
    process.exit();
  } catch (error) {
    console.error(error);
  }
})();

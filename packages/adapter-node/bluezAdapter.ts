import Bluez from "./src/adapterBluez";

(async () => {
  try {
    const bluez = new Bluez();
    await bluez.init();

    await bluez.on("discover", (...peripheral) => {
      console.log(peripheral);
    });

    await bluez.startScanning();
    await new Promise(res => setTimeout(res, 2000));
    await bluez.stopScanning();

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

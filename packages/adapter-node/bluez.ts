import Bluez from "./new-src/bluez";

(async () => {
  try {
    const bluez = new Bluez();
    await bluez.init();
    bluez.on("discover", (...args) => console.log(...args));
    await bluez.startDiscovery();
    await new Promise(resolve => setTimeout(resolve, 500));
    await bluez.stopDiscovery();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

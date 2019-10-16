import Adapter from "./new-src";

(async () => {
  try {
    const adapter = new Adapter();
    await adapter.init();
    await adapter.on("discover", (...args) => console.log(...args));
    await adapter.startScanning();
    await new Promise(resolve => setTimeout(resolve, 5000));
    await adapter.stopScanning();
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

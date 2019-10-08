import adapter from "./new-src";

(async () => {
  try {
    await adapter.init();
    await adapter.on("discover", (...args) => console.log(...args));
    await adapter.startScanning();
    await new Promise(resolve => setTimeout(resolve, 500));
    await adapter.stopScanning();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

import SblendidAdapter from "./src";

(async () => {
  try {
    console.log("Starting dev script");
    const adapter = new SblendidAdapter();

    let i = 10;
    const peripheral = await adapter.find((...peripheral) => {
      console.log(peripheral);
      return --i <= 0;
    });

    console.log("\n");
    console.log("Found", peripheral);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

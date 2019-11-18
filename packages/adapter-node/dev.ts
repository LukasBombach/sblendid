import SblendidAdapter from "./src";

(async () => {
  try {
    console.log("Starting dev script");

    const adapter = new SblendidAdapter();
    let i = 0;
    const peripheral = await adapter.find(async uuid => {
      console.log(uuid);
      console.log("waiting 1 seconds");
      await new Promise(res => setTimeout(res, 1000));
      return ++i >= 3;
    });

    console.log("\n");
    console.log("Found", peripheral);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

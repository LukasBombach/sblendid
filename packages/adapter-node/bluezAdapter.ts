import Bluez from "./src/adapterBluez";

(async () => {
  try {
    const bluez = new Bluez();
    await bluez.init();

    const findme = await bluez.find((...peripheral) => {
      const [, , , , { localName }] = peripheral;
      process.stdout.write(".");
      console.log(peripheral);
      return !!localName && /find me/i.test(localName);
    });

    console.log("\n", "Found this:");
    console.log(findme);

    const [puuid] = findme;

    console.log("connecting");
    await bluez.connect(puuid);
    console.log("connected");

    console.log("Getting services");
    const services = await bluez.getServices(puuid);
    console.log("Done etting services");

    console.log("Here are the services", services);

    console.log("Waiting for 10 seconds");
    await new Promise(res => setTimeout(res, 10000));

    console.log("done");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

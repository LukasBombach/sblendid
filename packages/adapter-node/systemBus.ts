import SystemBus from "./src/adapterBluez/systemBus";

(async () => {
  try {
    interface Methods {
      StartDiscovery: () => Promise<void>;
      StopDiscovery: () => Promise<void>;
    }

    const systemBus = new SystemBus();

    const adapterParams = {
      service: "org.bluez",
      path: "/org/bluez/hci0",
      name: "org.bluez.Adapter1"
    };

    const adapter = await systemBus.getInterface<Methods>(adapterParams);

    console.log("StartDiscovery");
    await adapter.StartDiscovery();
    console.log("StopDiscovery");
    await adapter.StopDiscovery();

    /* const iface: any = await systemBus.getInterface(adapterParams);

    console.log(Object.keys(iface.object.method));

    const adapter = Object.keys(iface.object.method).reduce<Methods>(
      (adapter, method) => {
        (adapter as any)[method] = (...args: any[]) =>
          new Promise((res, rej) => {
            iface[method](...args, (err: Error, ...data: any[]) =>
              err ? rej(err) : res(...data)
            );
          });
        return adapter;
      },
      {} as any
    );

     */

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

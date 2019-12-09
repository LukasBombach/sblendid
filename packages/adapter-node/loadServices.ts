(async () => {
  const adapter = await getAdapter();
  const manager = await getObjectManager();

  const peripheral = await findPeripheral(/roidmi/);

  await adapter.connect(uuid);

  const resolved = new Promise(res => {
    manager.on("InterfacesAdded", (path: string, interfaces: any) => {
      const service = interfaces["org.bluez.GattService1"];
      const characteristic = interfaces["org.bluez.GattCharacteristic1"];
    });
  });
})();

/* console.log(adapter.object);
    console.log(manager.object);

    manager.on("InterfacesAdded", interfacesAdded);

    await adapter.StartDiscovery();
    await new Promise(res => setTimeout(res, 5000));
    await adapter.StopDiscovery(); */

// console.log("InterfacesAdded", path /*, inspect(interfaces) */);
// const serviceDesc = interfaces["org.bluez.GattService1"];
// if (serviceDesc) {
//   console.log("Getting service", serviceDesc);
//   const service = await getService(path);
//   console.log("Loaded Service", inspect(service));
// }

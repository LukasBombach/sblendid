import Bluez from "./src/linux/bluez";

(async () => {
  try {
    const bluez = new Bluez();
    const objectManager = await bluez.getObjectManager();

    console.log(objectManager);

    const managedObjects = await objectManager.GetManagedObjects();

    console.log(managedObjects);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

import Bluez from "./src/linux/bluez";

(async () => {
  try {
    const bluez = new Bluez();
    const objectManager = await bluez.getObjectManager();

    console.log(objectManager);

    console.log("\n\n\n####\n\n\n");

    const managedObjects = await objectManager.GetManagedObjects();

    console.log(managedObjects);

    /* for (const obj of Object.values(managedObjects)) {
      console.log(obj);
    } */

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();

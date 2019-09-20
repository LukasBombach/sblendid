import Adapter, { AddressType } from "@sblendid/adapter-node";
import { Peripheral } from "../src";

(async () => {
  const options = {
    address: "00-14-22-01-23-45",
    addressType: "public" as AddressType,
    advertisement: {}
  };

  const adapter = new Adapter();
  const peripheral = new Peripheral("uuid", adapter, options);

  await peripheral.connect();
})();

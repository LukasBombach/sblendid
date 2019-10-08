import os from "os";
import Adapter from "./adapter";
import MacOSAdapter from "./adapterMacOS";
import WinRTAdapter from "./adapterWinRT";
import DBusAdapter from "./adapterDBus";
import { AdapterError } from "./errors";

let calledTimes = 0;

function getOsSpecificAdapter(): Adapter {
  const platform = os.platform();
  console.debug(`getOsSpecificAdapter has been called ${++calledTimes} times`);
  if (platform === "darwin") return new MacOSAdapter();
  if (platform === "win32") return new WinRTAdapter();
  if (platform === "linux") return new DBusAdapter();
  throw new AdapterError(`Unsupported platform "${platform}".`);
}

export default getOsSpecificAdapter();

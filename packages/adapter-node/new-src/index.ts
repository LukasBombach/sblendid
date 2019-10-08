import os from "os";
import Adapter from "./adapter";
import MacOSAdapter from "./adapterMacOS";
import WinRTAdapter from "./adapterWinRT";
import DBusAdapter from "./adapterDBus";

let calledTimes = 0;

function getOsSpecificAdapter(): Adapter {
  const platform = os.platform();
  const msg = `Unsupported platform "${platform}". Please file an issue at https://github.com/LukasBombach/sblendid/issues`;
  console.debug(`getOsSpecificAdapter has been called ${++calledTimes} times`);
  if (platform === "darwin") return new MacOSAdapter();
  if (platform === "win32") return new WinRTAdapter();
  if (platform === "linux") return new DBusAdapter();
  throw new Error(msg);
}

export default getOsSpecificAdapter();

import os from "os";
import Adapter from "./adapter";
import { AdapterError } from "./errors";

function getOsSpecificAdapter(): new () => Adapter {
  const platform = os.platform();
  if (platform === "darwin") return require("./adapterMacOS").default;
  if (platform === "win32") return require("./adapterWinRT").default;
  if (platform === "linux") return require("./adapterDBus").default;
  throw new AdapterError(`Unsupported platform "${platform}".`);
}

export default getOsSpecificAdapter();

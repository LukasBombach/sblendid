import os from "os";
import SblendidAdapter from "../types/sblendidAdapter";
import { AdapterError } from "./errors";

function getOsSpecificAdapter(): new () => SblendidAdapter {
  const platform = os.platform();
  if (platform === "darwin") return require("./adapterMacOS").default;
  if (platform === "win32") return require("./adapterWinRT").default;
  if (platform === "linux") return require("./adapterBluez").default;
  throw new AdapterError(`Unsupported platform "${platform}".`);
}

export default getOsSpecificAdapter();

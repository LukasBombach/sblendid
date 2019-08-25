import os from "os";
import path from "path";
import { EventEmitter } from "events";
import { inherits } from "util";
import BindingsType from "./types/bindings";

// todo https://github.com/springmeyer/node-addon-example/

function loadNativeAddonFromFs(): typeof BindingsType {
  const platform = os.platform();
  const macPath = path.resolve(__dirname, "../native/noble_mac.node");
  const winPath = path.resolve(__dirname, "../native/noble_winrt.node");

  if (platform === "darwin") {
    return require(macPath).NobleMac;
  }

  if (platform === "win32") {
    return require(winPath).NobleWinrt;
  }

  throw new Error(
    `Unsupported platform "${platform}". Please file an issue at https://github.com/LukasBombach/sblendid/issues`
  );
}

function getBindings() {
  const NativeAddon = loadNativeAddonFromFs();
  inherits(NativeAddon, EventEmitter);
  return NativeAddon;
}

const Bindings = getBindings();

export default Bindings;

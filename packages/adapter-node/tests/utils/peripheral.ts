import { Params } from "../../src/index";

export function hasName(
  name: string
): (...peripheral: Params<"discover">) => boolean {
  return (...peripheral) => peripheral[4].localName === name;
}

export function isConnectable(
  onFound?: (peripheral: Params<"discover">) => {}
): (...peripheral: Params<"discover">) => boolean {
  return (...peripheral) => {
    if (peripheral[3] && onFound) onFound(peripheral);
    return peripheral[3];
  };
}

import chalk from "chalk";
import Adapter from "./src/adapter";

export function logAll(adapter: Adapter): void {
  const events: any[] = [
    "stateChange",
    "discover",
    "connect",
    "disconnect",
    "rssiUpdate",
    "servicesDiscover",
    "includedServicesDiscover",
    "characteristicsDiscover",
    "read",
    "write",
    "broadcast",
    "notify",
    "descriptorsDiscover",
    "valueRead",
    "valueWrite",
    "handleRead",
    "handleWrite",
    "handleNotify",
    "scanStart",
    "scanStop"
  ];

  for (const event of events) {
    adapter.on(event, (...args) => {
      console.debug(chalk.grey("event"), chalk.blue(event), args);
    });
  }
}

import Adapter from "./adapter";

export function onyAnyEvent(
  adapter: Adapter,
  callback: (event: string, ...args: any[]) => void
): void {
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
    adapter.on(event, (...args) => callback(event, ...args));
  }
}

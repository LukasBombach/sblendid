import Peripheral from "../src/peripheral";

export default function logAll(peripheral: Peripheral): void {
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
    peripheral.adapter.on(event, (...args) => {
      console.log(event, args);
    });
  }
}

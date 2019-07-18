# S*ble*ndid

Complete re-implementation of [Noble](https://github.com/noble/noble) (which is abandoned) and

- [x] 💪 Completely typed and written in TypeScript
- [x] 💍 Has Promises!
- [x] 🎚️ Improved high-level API and full access to low-level API
- [x] ⚙️ Completely configurable Bluetooth adapters to make it work on all devices and OSs
- [x] 🥳 Up to date and works with the latest versions (and the old ones) of macOS, Windows, Linux etc

## Installation

```shell
npm i sblendid --save
```

## Usage (examples)

### Read from, write to and get notified about a characteristic

```js
import Sblendid from "sblendid";

// Find a Peripheral called "Bluetooth Dongle" and
// get the first characteristic from the first service
const peripheral = Sblendid.connect("Bluetooth Dongle");
const services = await peripheral.getServices();
const characteristics = await services[0].getCharacteristics();

// Read the value from the first characteristic
const value = await characteristics[0].read();

// Write a value to the first characteristic
await characteristics[0].write("0000");

// Get notified about changes
characteristics[0].onChange(value => {
  console.log(value);
});
```

### Scan and show all devices in your proximity for 5 seconds

```js
import Sblendid from "sblendid";

// Initialize your bluetooth device
const sblendid = new Sblendid();
await sblendid.powerOn();

// Start scanning and log every peripheral that is found
sblendid.startScanning(peripheral => {
  console.log(peripheral);
});

// Stop scanning after 5000ms
setTimeout(() => sblendid.stopScanning(), 5000);
```

### Low-Level API access

```js
import Sblendid from "sblendid";

// Initialize your bluetooth device
const sblendid = new Sblendid();
await sblendid.powerOn();

// Listen for the discover event that gets called for each device that you can find
sblendid.adapter.on(
  "discover",
  (peripheralUuid, address, addressType, connectable, advertisement, rssi) => {
    // ...
  }
);

// Start scanning
sblendid.adapter.startScanning();

// Stop scanning after 5000ms
setTimeout(() => sblendid.adapter.stopScanning(), 5000);
```

## Documentation

Please refer to the full documentation for an complete description of the API and more examples for common use cases.

- [Full documentation]()
- [API Description]()
- [Examples for common use cases]()

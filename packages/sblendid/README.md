# S*ble*ndid

Reimplementation of Noble but

- [x] 💪 Completely typed and written in TypeScript
- [x] 💍 Has Promises!
- [x] 🎚️ Improved high-level API and full access to low-level API
- [x] ⚙️ Completely configurable Bluetooth adapters to make it work on all devices and OSs
- [x] 🥳 Works with the latest macOS (and all other OSes)

## Installation

```shell
npm i sblendid
```

## Usage (examples)

### Read from, write to and get notified about a characteristic

```js
import Sblendid from "sblendid";

const peripheral = Sblendid.connect("Bluetooth Dongle");
const services = await peripheral.getServices();
const characteristics = await services[0].getCharacteristics();

const value = await characteristics[0].read();
await characteristics[0].write("0000");

characteristics[0].onChange(value => {
  console.log(value);
});
```

### Scan and show all devices in your proximity for 5 seconds

```js
import Sblendid from "sblendid";

await sblendid.powerOn();

sblendid.startScanning(peripheral => {
  console.log(peripheral);
});

setTimeout(() => sblendid.stopScanning(), 5000);
```

## Documentation

Please refer to the full documentation for an complete description of the API and more examples for common use cases.

- [Full documentation]()
- [API Description]()
- [Examples for common use cases]()

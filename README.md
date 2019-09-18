# S*ble*ndid

&nbsp; 🦋 &nbsp;Lightweight, no Dependencies<br>
&nbsp; 💍 &nbsp;Promise-Based API<br>
&nbsp; 🥳 &nbsp;100% TypeScript and Native Code (C++ / Objective C)<br>
&nbsp; 💯 &nbsp;100% Test Coverage<br>

## Basic Bluetooth knowledge

## Usage

Install Sblendid and the adapter for Node with npm or yarn

```bash
npm install @sblendid/sblendid @sblendid/adapter-node
```

In the future, Sblendid should support multiple platforms including React Native and WebBluetooth.
Hence, there is a separate package for for using Sblendid with Node so you can swap adapters for
using it on another platform.

### Scan for Peripherals around you

```ts
import Sblendid from "@sblendid/sblendid";

(async () => {
  const sblendid = await Sblendid.powerOn();

  sblendid.startScanning(peripheral => {
    const { uuid, name, connectable, advertisement } = peripheral;
    const { txPowerLevel, manufacturerData, serviceUUIDs } = advertisement;

    console.log("Found Peripheral:");
    console.log(uuid, name, connectable);
    console.log(txPowerLevel, manufacturerData, serviceUUIDs);
  });
})();
```

### Connect to a Peripheral by name and read its services

> The [DE1+ Coffee machine](https://decentespresso.com/) can be found via Bluetooth
> with the name "DE1"

```ts
import Sblendid from "@sblendid/sblendid";

(async () => {
  const peripheral = await Sblendid.connect("DE1");
  const services = await peripheral.getServices();
})();
```

### Read a Characteristic

```ts
import Sblendid from "@sblendid/sblendid";

const batteryServiceUuid = "180f";
const batteryLevelUuid = "2a19";

(async () => {
  const peripheral = await Sblendid.connect(peripheral =>
    peripheral.hasService(batteryServiceUuid)
  );

  const batteryService = await peripheral.getService(batteryServiceUuid);
  const batteryLevel = await batteryService!.read(batteryLevelUuid);

  console.log("Battery Level", batteryLevel.readUInt8(0), "%");
})();
```

### Subscribe to a Characteristic

```ts
import Sblendid from "@sblendid/sblendid";

const batteryServiceUuid = "180f";
const batteryLevelUuid = "2a19";

(async () => {
  const peripheral = await Sblendid.connect(peripheral =>
    peripheral.hasService(batteryServiceUuid)
  );

  const batteryService = await peripheral.getService(batteryServiceUuid);

  await batteryService!.on(batteryLevelUuid, batteryLevel => {
    console.log("Battery Level", batteryLevel.readUInt8(0), "%");
  });
})();
```

## API

Sblendid has 4 main classes

| Class            | Desciption                                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sblendid`       | Lets you find and connect to peripherals                                                                                                                                                                                                                                                                               |
| `Peripheral`     | Lets you connect to peripherals and read its services and RSSI                                                                                                                                                                                                                                                         |
| `Service`        | Lets you read, write and subscribe to updates on values (characteristics) of a service as well as                                                                                                                                                                                                                      | fetching all available characteristics |
| `Characteristic` | A representation of a single characteristic of a service that lets you read, write and subscribe to updates of a specific value. Usually you will not need to use this class as everything you can do with this on a single characteristic, you can already do with the service class on all available characteristics |

### `Sblendid`

#### API Overview

Here you can see the entire public API of the `Sblendid` class for an overview. You can find
a more detailed description below.

<!-- prettier-ignore -->
```ts
class Sblendid {
  public adapter: Adapter;

  public static async powerOn(): Promise<Sblendid> {}
  public static async connect(condition: Condition): Promise<Peripheral> {}
  public async powerOn(): Promise<void> {}
  public async find(condition: Condition): Promise<Peripheral> {}
  public startScanning(listener?: PeripheralListener): void {}
  public stopScanning(): void {}
}
```

#### `static async powerOn(): Promise<Sblendid>`

Before you can use BLE on your machine you need to turn on
your BLE adapter. This static method will turn on the adapter
and return an instance of sblendid that you can then use to
find and connect to peripherals

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = await Sblendid.powerOn();
sblendid.startScanning();
```

#### `static async connect(condition: Condition): Promise<Peripheral>`

Often times you have a specific peripheral in mind you want to
connect to. You would usually

1. turn on your BLE adapter
1. start scanning
1. check each peripheral if it is what you are looking for
1. stop scanning
1. connect to the peripheral

There is a shortcut for that. You can call `Sblendid.connect` to do all that.
Pass either a peripheral name, uuid, address or callback function as an argument
and you will get a connected peripheral as return value once the peripheral has
been found.

The callback function will receive an instance of a `Peripheral` that represents any
peripheral found while scanning. The callback function can be sync or async
(i.e. return a Promise) and must always return aór resolve to a Boolean signaling
of the given peripheral is the one you were looking for. If true, `Sblendid.connect`
will stop scanning, connect to that peripheral and return it.

```ts
import Sblendid from "@sblendid/sblendid";

// By Name
const peripheral = await Sblendid.connect("My Peripheral");

// By UUID
const peripheral = await Sblendid.connect("3A62F159");

// By Address
const peripheral = await Sblendid.connect("00-14-22-01-23-45");

// With a callback
const peripheral = await Sblendid.connect(periperal =>
  Boolean(periperal.connectable)
);

// With an async callback
const peripheral = await Sblendid.connect(
  async periperal => await isPeripheralIAmLookingFor(periperal)
);
```

> ##### Timeouts
>
> It is important to know that no function in this libary has a timeout. `Sblendid.connect`
> will scan indefinitely unless you make sure it doesn't. At some point in the future
> timeouts will be built in but it is not a scope of version 1.0.0

#### `new Sblendid()` (Constructor)

You can instantiate Sblendid like any other class. It has no parameters. You will have to
turn it on before using it though.

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = new Sblendid();
```

#### `async powerOn(): Promise<void>`

If you instantiate Sblendid in your own, this method lets you turn on your BLE adapter.
It returns a promise that resolves (with no value) when the adater ist powered on.

Note that you can also use `const sblendid = await Sblendid.powerOn();` to achieve the
same thing.

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = new Sblendid();
await sblendid.powerOn();
```

#### `async find(condition: Condition): Promise<Peripheral>`

Will scan for a peripheral and return it once it's found. Unlike `Sblendid.connect`
`find` will not automatically connect to the peripheral. `find` will accept the same
parameters as `Sblendid.connect` to find a a peripheral.

Note that this is an instance method, so you will have to instantiate and turn on
Sblendid first.

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = await Sblendid.powerOn();
const peripheral = await sblendid.find("My Peripheral");
```

#### `startScanning(listener?: PeripheralListener): void`

Will start scanning for peripherals. Instead of finding a specific peripheral
and returning it, this method will just scan your surroundings and call a
callback for every peripheral it finds. It will do so indefinitely until you
call `sblendid.stopScanning()`. This method has no return value and is not
asynchronous.

The callback function will receive a single argument which is an instance of
`Peripheral`.

> Note that when you call `sblendid.startScanning` multiple times with different
> listeners only the last listener will be used and all others will be discarded.

```ts
import Sblendid from "@sblendid/sblendid";

function listener(peripheral) {
  console.log("Found peripheral with uuid", peripheral.uuid);
}

const sblendid = await Sblendid.powerOn();
sblendid.startScanning(listener);
```

#### `stopScanning(): void`

Will tell sblendid to stop scanning. The listener you may have provided in
`sblendid.startScanning` will be discarded and not be called anymore.

```ts
import Sblendid from "@sblendid/sblendid";

function listener(peripheral) {
  console.log("Found peripheral with uuid", peripheral.uuid);
}

const sblendid = await Sblendid.powerOn();
sblendid.startScanning(listener);

await new Promise(resolve => setTimeout(resolve, 1000));

sblendid.stopScanning();
```

### `Peripheral`

#### API Overview

Here you can see the entire public API of the `Peripheral` class for an overview. You can find
a more detailed description below.

<!-- prettier-ignore -->
```ts
class Peripheral {
  public uuid: PUUID;
  public adapter: Adapter;
  public name: string;
  public address: string;
  public addressType: AddressType;
  public advertisement: Advertisement;
  public connectable?: boolean;
  public state: State;

  public async connect(): Promise<void> {}
  public async disconnect(): Promise<void> {}
  public async getService(uuid: SUUID, converters?: Converters): Promise<Service<Converters> | undefined> {}
  public async getServices(serviceConverters?: ServiceConverters): Promise<Service<any>[]> {}
  public async hasService(uuid: SUUID): Promise<boolean> {}
  public async getRssi(): Promise<number> {}
  public isConnected(): boolean {}
}
```

### `Service`

#### API Overview

Here you can see the entire public API of the `Service` class for an overview. You can find
a more detailed description below.

<!-- prettier-ignore -->
```ts
class Service {
  public uuid: SUUID;
  public peripheral: Peripheral;

  public async read(name: Name): Promise<Value> {}
  public async write( name: Name, value: Value, withoutResponse?: boolean): Promise<void> {}
  public async on(name: Name, listener: Listener): Promise<void> {}
  public async off(name: Name, listener: Listener): Promise<void> {}
  public async getCharacteristic(name: Name): Promise<Characteristic> {}
  public async getCharacteristics(): Promise<Characteristic[]> {}
}
```

### `Characteristic`

#### API Overview

Here you can see the entire public API of the `Characteristic` class for an overview. You can find
a more detailed description below.

<!-- prettier-ignore -->
```ts
class Characteristic {
  public uuid: CUUID;
  public service: Service;
  public properties: Properties;

  public async read(): Promise<Value> {}
  public async write(value: Value, withoutResponse?: boolean): Promise<void> {}
  public async on(event: "notify", listener: Listener): Promise<void> {}
  public async off(event: "notify", listener: Listener): Promise<void> {}
}
```

<p align="center">
  <img alt="Sblendid" src="https://github.com/LukasBombach/sblendid/blob/master/packages/sblendid/docs/images/sblendid-logo.svg">
</p>
<p align="center">
  <strong>Bluetooth Low Energy for JavaScript</strong><br>
</p>
<p align="center">
  <img alt="separator" src="https://raw.githubusercontent.com/LukasBombach/new-type-js/master/demo/images/separator.png" height="59">
</p>

- [Usage](#basic-workflow) - How to use Sblendid and interact with Peripherals
- [API](#api) - Full API description of all functions of this library
- [Examples](#more-examples) - Further examples

With Sblendid you can find and connect to Bluetooth Low Energy (BLE) devices (called peripherals) and interact with them.
It is implemented in TypeScript and built on top of native code using the system's bluetooth APIs.

![Build Status](https://github.com/LukasBombach/sblendid/workflows/build/badge.svg)
![Code Climate Coverage](https://img.shields.io/codeclimate/coverage/LukasBombach/sblendid)
![MIT License](https://img.shields.io/github/license/LukasBombach/sblendid)

## Install

```bash
npm install @sblendid/sblendid @sblendid/adapter-node
```

Sblendid supports Linux, macOS and Windows. In the future, Sblendid should support other platforms
including React Native and WebBluetooth. Hence, you have to install the `@sblendid/adapter-node`
package as a seperate dependency. Native modules for macOS and Windows are provided by
[Timeular](https://github.com/Timeular) (thanks!)

- If something doesn’t work, please [file an issue](https://github.com/LukasBombach/sblendid/issues/new).<br>
- If you have feature request, please [file an issue](https://github.com/LukasBombach/sblendid/issues/new).<br>

As this is in an early stage, your feedback is very welcome, please don't hesitate to file issues.

## Basic workflow

With BLE you usually use the [GATT protocol](https://www.bluetooth.com/specifications/gatt/). This means you
connect to a `peripheral`, get one ore more `services` of that peripheral and `read` / `write` / `subscribe to`
values on these services. With Sblendid this works as follows:

```js
import Sblendid from "@sblendid/sblendid";

(async () => {
  const peripheral = await Sblendid.connect("My Peripheral");
  const service = await peripheral.getService("uuid");

  const value = await service.read("uuid");
  await service.write("uuid", Buffer.from("value", "utf8"));
  service.on("uuid", value => console.log(value));
})();
```

> ##### Timeouts
>
> It is important to know that no function in this libary has a timeout. `Sblendid.connect`
> will scan indefinitely unless you make sure it doesn't. At some point in the future
> timeouts will be built in but it is not a scope of version 1.0.0

## Converters

In the previous example, all values I read, write or get notified for are
[`Buffers`](https://nodejs.org/api/buffer.html). It might get weary to constantly convert
`Buffers` to the values you actually want to work on. For this, Sblendid introduces a
concept called `converters`.

```js
import Sblendid from "@sblendid/sblendid";

// Converts buffers to another value and back. You can
// work with numbers, objects, classes or anything as
// long as you write appropriate decode and encode functions
const converters: {
  myValue: {
    uuid: "uuid",
    decode: buffer => buffer.toString(),
    encode: message => Buffer.from(message, "utf8")
  },
  otherValue: {
    uuid: "anotherUuid",
    decode: buffer => buffer.readUInt8(0),
    encode: num => Buffer.from([num])
  }
};

(async () => {
  const peripheral = await Sblendid.connect("My Peripheral");
  const service = await peripheral.getService("uuid", converters);

  // value will be a string
  const value = await service.read("myValue");

  // you can pass a string
  await service.write("myValue", "value");

  // value will also be a string
  service.on("myValue", value => console.log(value));

  // values for "otherValue" will be numbers
  const value2 = await service.read("otherValue");
  await service.write("otherValue", 22);
  service.on("otherValue", value => console.log(value));
})();
```

## Scan for Peripherals around you

```js
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

The callback in `startScanning` will receive an instance of `Peripheral`. See

- [Sblendid.powerOn](#static-async-poweron-promisesblendid)
- [sblendid.startScanning](#startscanninglistener-peripherallistener-void)
- [Peripheral](#peripheral)

## Connect to a Peripheral

There are several ways to find and connect to a peripheral.
You can use `Sblendid.connect` and pass either a

- Peripheral `Name`
- Peripheral `UUID`
- Peripheral `Address`
- A `callback function` returning a boolean, or a Promise resolving to a boolean

to it to tell Sblendid which peripheral you want to connect to.
`Sblendid.connect` will use your criteria to scan your surroundings
and connect to and return the peripheral once it's found.

```js
import Sblendid from "@sblendid/sblendid";

(async () => {
  const peripheral = await Sblendid.connect("My Peripheral");
  const peripheral = await Sblendid.connect("3A62F159");
  const peripheral = await Sblendid.connect("00-14-22-01-23-45");
  const peripheral = await Sblendid.connect(peripheral =>
    peripheral.name.startsWith("My")
  );
  const peripheral = await Sblendid.connect(
    async peripheral => await checkSomething(peripheral)
  );
})();
```

The return type of `connect` will be an instance of `Peripheral`. See

- [Sblendid.connect](#static-async-connectcondition-condition-promiseperipheral)
- [Peripheral](#peripheral)

## Get all Services from a Peripheral

```js
import Sblendid from "@sblendid/sblendid";

(async () => {
  const peripheral = await Sblendid.connect("My Peripheral");
  const services = await peripheral.getServices();
})();
```

The return type of `getServices` will be an array of instances of `Peripheral`. See

- [peripheral.getServices]
- [Service](#service)

## Get all Characteristics from a Service

```js
import Sblendid from "@sblendid/sblendid";

(async () => {
  const peripheral = await Sblendid.connect("My Peripheral");
  const service = await peripheral.getService("a000");
  const characteristics = await service.getCharacteristics();
})();
```

## Read a Characteristic

> ##### Read Values
>
> Unless you use `converters`, values read will be Buffers

```js
import Sblendid from "@sblendid/sblendid";

const batteryServiceUuid = "180f";
const batteryLevelUuid = "2a19";

(async () => {
  const peripheral = await Sblendid.connect(peripheral =>
    peripheral.hasService(batteryServiceUuid)
  );

  const batteryService = await peripheral.getService(batteryServiceUuid);
  const batteryLevel = await batteryService.read(batteryLevelUuid);

  console.log("Battery Level", batteryLevel.readUInt8(0), "%");
})();
```

## Subscribe to a Characteristic

> ##### Subscribe Values
>
> Unless you use `converters`, values you get from a subscription will be Buffers

```js
import Sblendid from "@sblendid/sblendid";

const batteryServiceUuid = "180f";
const batteryLevelUuid = "2a19";

(async () => {
  const peripheral = await Sblendid.connect(peripheral =>
    peripheral.hasService(batteryServiceUuid)
  );

  const batteryService = await peripheral.getService(batteryServiceUuid);

  await batteryService.on(batteryLevelUuid, batteryLevel => {
    console.log("Battery Level", batteryLevel.readUInt8(0), "%");
  });
})();
```

## Write to a Characteristic

> ##### Write Values
>
> Unless you use `converters`, values you pass to a write operation must be Buffers

```js
import Sblendid from "@sblendid/sblendid";

const alertServiceUuid = "1811";
const newAlertUuid = "2a44";

(async () => {
  const peripheral = await Sblendid.connect(peripheral =>
    peripheral.hasService(alertServiceUuid)
  );

  const alertService = await peripheral.getService(alertServiceUuid);
  await alertService.write(newAlertUuid, Buffer.from("Message", "utf8");
})();
```

## More examples

You can find more examples in the Examples folder:

👉 [packages/sblendid/examples](https://github.com/LukasBombach/sblendid/tree/master/packages/sblendid/examples)

> ##### Running Examples
>
> You can run any of these examples by cloning this repository, building the library and calling `yarn example`:
>
> ```bash
> git clone git@github.com:LukasBombach/sblendid.git
> cd sblendid
> yarn && yarn build
> cd packages/sblendid
> yarn example examples/<filename>
> ```

## API

Sblendid has 4 main classes

| Class            | Desciption                                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sblendid`       | Lets you find and connect to peripherals                                                                                                                                                                                                                                                                               |
| `Peripheral`     | Lets you connect to peripherals and read their services and RSSIs                                                                                                                                                                                                                                                      |
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

  constructor() {}
  public static async powerOn(): Promise<Sblendid> {}
  public static async connect(condition: Condition): Promise<Peripheral> {}
  public async powerOn(): Promise<void> {}
  public async find(condition: Condition): Promise<Peripheral> {}
  public startScanning(listener?: PeripheralListener): void {}
  public stopScanning(): void {}
}
```

#### Properties

- `adapter` - An instance of the low-level Bluetooth adapter
  that Sblendid uses, right now this will be an instance of
  `@sblendid/adapter-node`. See [packages/adapter-node](https://github.com/LukasBombach/sblendid/tree/master/packages/adapter-node)

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

  constructor(uuid: PUUID, adapter: Adapter, options: Options) {}
  public async connect(): Promise<void> {}
  public async disconnect(): Promise<void> {}
  public async getService(uuid: SUUID, converters?: Converters): Promise<Service<Converters> | undefined> {}
  public async getServices(serviceConverters?: ServiceConverters): Promise<Service<any>[]> {}
  public async hasService(uuid: SUUID): Promise<boolean> {}
  public async getRssi(): Promise<number> {}
  public isConnected(): boolean {}
}
```

#### Properties

- `uuid` - The UUID of the peripheral
- `adapter` - An instance of the low-level Bluetooth adapter
  that Sblendid uses, right now this will be an instance of
  `@sblendid/adapter-node`. See [packages/adapter-node](https://github.com/LukasBombach/sblendid/tree/master/packages/adapter-node)
- `name` - The `localName` of the peripheral. This
  is the same as `peripheral.advertisement.localName` and will
  be an empty string if localName on the advertisement is
  not available
- `address` - The address of the peripheral
- `addressType` - The address type of the peripheral, can
  either be `public`, `random` or `unknown`
- `advertisement` - An object with the advertisement information of a peripheral. See [packages/adapter-node/src/peripheral.ts](https://github.com/LukasBombach/sblendid/blob/2c4de5914cb3372aca6eb80d686c903e3d1c27bc/packages/adapter-node/src/peripheral.ts#L10-L16)
- `connectable` - Whether or not the peripheral can be connected to. _Important_ This is
  an info the peripheral advertises itself with. Sometimes, even thought it says it's not
  connectable, it actually is.
- `state` - The connection state of the peripheral, can either be `connecting`, `connected`, `disconnecting` or `disconnected`

#### `new Peripheral(uuid: PUUID, adapter: Adapter, options: Options)` (Constructor)

Creates a new Peripheral instance

```ts
import { Peripheral } from "@sblendid/sblendid";
import Adapter from "@sblendid/adapter-node";

const options = {
  address: "00-14-22-01-23-45",
  addressType: "public",
  advertisement: {
    localName: "My Peripheral",
    txPowerLevel: 10,
    serviceUUIDs: ["f055e3", "143cba", "e72a1e"],
    manufacturerData: Buffer.from([]),
    serviceData: [
      {
        uuid: "43f9d8",
        data: Buffer.from([])
      }
    ]
  },
  connectable: true
};

const adapter = new Adapter();
const peripheral = new Peripheral("3A62F159", adapter, options);
```

_However_, you would usually create a Peripheral instance by
getting it from the `Sblendid` class using `connect`, `find`
or `startScanning`

```ts
import Sblendid from "@sblendid/sblendid";

const peripheral = Sblendid.connect();
const peripheral = new Sblendid().find();
new Sblendid().startScanning(peripheral => {});
```

> To bring this API documentation close to how most people
> would use this library I will receive my `Periperal`
> instance from the `Sblendid` class instead of the constructor
> in the following examples

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

## License

MIT

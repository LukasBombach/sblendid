import Joi, { AnySchema } from "@hapi/joi";

type Event = "discover";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeEvent(argument: Event): R;
    }
  }
}

const bluetoothServiceUUID = Joi.alternatives(
  Joi.string().guid(),
  Joi.number()
);

const bluetoothServiceUUIDArray = Joi.array().items(bluetoothServiceUUID);

const advertisement = Joi.object({
  localName: Joi.string().optional(),
  txPowerLevel: Joi.number().optional(),
  serviceUuids: bluetoothServiceUUIDArray.optional(),
  manufacturerData: Joi.binary().optional(),
  serviceData: Joi.binary().optional()
});

const peripheralUuid = Joi.string().guid();
const address = Joi.string().guid();
const addressType = Joi.string().valid("public", "random", "unknown");
const connectable = Joi.boolean();
const rssi = Joi.number().positive();

const events: Record<Event, AnySchema> = {
  discover: Joi.array().ordered(
    peripheralUuid,
    address,
    addressType,
    connectable,
    advertisement,
    rssi
  )
};

expect.extend({
  toBeEvent(received: any, argument: Event) {
    if (typeof events[argument] === "undefined") {
      return {
        message: () => `event "${argument}" cannot be emitted by sblendid`,
        pass: false
      };
    }

    const { error } = events[argument].validate(received);

    return error
      ? {
          message: () => `expected ${received} to match the event ${argument}`,
          pass: false
        }
      : {
          message: () =>
            `expected ${received} not to match the event ${argument}`,
          pass: true
        };
  }
});

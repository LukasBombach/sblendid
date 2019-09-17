import Joi, { AnySchema } from "@hapi/joi";

export type Event = "discover";

export const bluetoothCharacteristicUUID = Joi.alternatives(
  Joi.string().guid(),
  Joi.number()
);

export const bluetoothServiceUUID = Joi.alternatives(
  Joi.string().guid(),
  Joi.number()
);

export const properties = {
  read: Joi.boolean(),
  write: Joi.boolean(),
  notify: Joi.boolean()
};

export const characteristicData = {
  uuid: bluetoothCharacteristicUUID,
  properties: properties
};

export const ArrayOfBluetoothServiceUUIDs = Joi.array().items(
  bluetoothServiceUUID
);

export const ArrayOfCharacteristicData = Joi.array().items(characteristicData);

export const advertisement = Joi.object({
  localName: Joi.string().optional(),
  txPowerLevel: Joi.number().optional(),
  serviceUuids: ArrayOfBluetoothServiceUUIDs.optional(),
  manufacturerData: Joi.binary().optional(),
  serviceData: Joi.binary().optional()
});

export const peripheralUuid = Joi.string().guid();
export const address = Joi.string().guid();
export const addressType = Joi.string().valid("public", "random", "unknown");
export const connectable = Joi.boolean();
export const rssi = Joi.number().positive();

export const events: Record<Event, AnySchema> = {
  discover: Joi.array().ordered(
    peripheralUuid,
    address,
    addressType,
    connectable,
    advertisement,
    rssi
  )
};

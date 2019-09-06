interface Item<T> {
  name: string;
  uuid: CUUID;
  decode: (value: Buffer) => T;
}

type Items = Item<any>[];

type ItemName<C extends Item<any>[]> = C extends (infer U)[]
  ? U extends Item<any>
    ? U["name"]
    : never
  : never;

type ItemValue<C> = C extends Item<infer T>[] ? T : never;

type MyItems = [Item<string>, Item<number>];

type MyNames = ItemName<MyItems>;

const infoItem: Item<string> = {
  name: "info",
  uuid: "180a",
  decode: (v: Buffer) => v.toString()
};

const pressureItem: Item<number> = {
  name: "pressure",
  uuid: "1810",
  decode: (v: Buffer) => v.readInt32BE(0)
};

const items: MyItems = [infoItem, pressureItem];

const names: ItemName<MyItems> = "infossss";
const values: ItemValue<MyItems, "info"> = 222;

function decodeItem<N extends string>(
  name: ItemName<MyItems, N>,
  buffer: Buffer
): ItemValue<MyItems, N> {
  const item = items.find(item => item.name === name)!;
  return item.decode(buffer);
}

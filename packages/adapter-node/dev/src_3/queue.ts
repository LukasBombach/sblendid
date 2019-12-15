export type Item = () => Promise<any> | any;
export type ItemReturn<T> = T extends "function"
  ? ReturnType<Item>
  : Promise<T>;
export type ItemFunction<T> = (...args: any[]) => Promise<ItemReturn<T>>;
export type Resolve = (value?: unknown) => void;
export type Reject = (reason?: any) => void;

export default class Queue {
  private items: Item[] = [];
  private working: boolean = false;

  public async add<T>(item: T): Promise<ItemReturn<T>> {
    return new Promise((resolve, reject) => {
      this.items.push(this.getItem<T>(item, resolve, reject));
      this.work();
    }) as any;
  }

  public async end(finalFn: Item = () => {}): Promise<ReturnType<Item>> {
    this.items = [];
    return await finalFn();
  }

  private async work(): Promise<void> {
    if (this.working) return;
    this.working = true;
    while (this.items.length) await this.items.shift()!();
    this.working = false;
  }

  private getItem<T>(item: T, resolve: Resolve, reject: Reject) {
    const itemFn = this.getItemAsFn(item);
    return () =>
      itemFn()
        .then(resolve)
        .catch(reject);
  }

  private getItemAsFn<T>(item: T): ItemFunction<T> {
    if (typeof item !== "function") return async () => item as any;
    return async (...args: any[]) => await item(...args);
  }
}

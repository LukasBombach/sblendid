export type PromiseFn = () => Promise<any> | any;
type Resolver = (value?: unknown) => void;
type Rejector = (reason?: any) => void;

export default class Queue {
  private items: PromiseFn[];
  private working: boolean;

  constructor() {
    this.items = [];
    this.working = false;
  }

  // todo is the return value properly typed?
  public async add(item: any): Promise<ReturnType<PromiseFn>> {
    return new Promise((resolve, reject) => {
      this.items.push(this.getItem(item, resolve, reject));
      this.work();
    });
  }

  public async end(finalFn: PromiseFn = () => {}): Promise<any> {
    this.items = [];
    return await finalFn();
  }

  private async work(): Promise<void> {
    if (this.working) return;
    this.working = true;
    while (this.items.length) await this.items.shift()!();
    this.working = false;
  }

  private getItem(item: any, resolve: Resolver, reject: Rejector) {
    const itemFn = typeof item === "function" ? async () => await item() : async () => item;
    return () =>
      itemFn()
        .then(resolve)
        .catch(reject);
  }
}

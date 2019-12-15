export default class List<T> {
  private set = new Set<T>();

  // todo this will pobably allow duplicate devices and services as they are different objects / pointers
  public add(device: T): void {
    this.set.add(device);
  }

  find(predicate: (value: T) => unknown): T | undefined {
    return [...this.set].find(predicate);
  }

  findAll(callback: (value: T) => boolean): T[] {
    return [...this.set].filter(callback);
  }
}

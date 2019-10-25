export default class List<T> {
  private set = new Set<T>();

  public add(device: T): void {
    this.set.add(device);
  }

  find(predicate: (value: T) => unknown): T | undefined {
    return [...this.set].find(predicate);
  }
}

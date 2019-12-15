import List from "../list";

export default class DBusInterface<P = {}, A = {}> {
  private static instances = new List<any>();
  public readonly path: string;
  public readonly props: P;
  public readonly api?: A;

  static add<T, P = {}>(path: string, props: P): T {
    const instance: T = new this(path, props) as any;
    this.instances.add(instance);
    return instance;
  }

  static find<T, P extends keyof T>(prop: P, val: any): T | undefined {
    return this.instances.find(i => i[prop] === val);
  }

  protected constructor(path: string, props: P) {
    this.path = path;
    this.props = props;
  }
}

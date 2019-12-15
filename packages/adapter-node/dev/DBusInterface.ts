class A<P = {}> {
  public static arr: any[] = [];

  public readonly path: string;
  public readonly props: P;

  static add<T, P = {}>(path: string, props: P): T {
    const instance = new this(path, props);
    this.arr.push(instance);
    return instance as any;
  }

  protected constructor(path: string, props: P) {
    this.path = path;
    this.props = props;
  }
}

class B extends A {
  static arr: B[] = [];
  b(): void {}
}

class C extends A {
  static arr: C[] = [];
  c(): void {}
}

const b = B.add<B>("path/to/B", { b: true });
const c = C.add<C>("path/to/C", { c: true });

console.log("A", A.arr);
console.log("B", B.arr);
console.log("C", C.arr);

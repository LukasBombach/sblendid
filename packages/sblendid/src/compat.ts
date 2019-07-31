import BuiltinModule from "module";

type AliasModule = Function & { _resolveFilename: ResolveFilename };
type ResolveFilename = (
  request: string,
  parentModule: BuiltinModule,
  isMain: boolean
) => any;

export default class AliasNoble {
  private static replacements: [string[], string][] = [
    [["noble", "noble/lib/noble"], "sblendid/compat"]
  ];
  private static moduleRef: AliasModule = AliasNoble.getModule();
  private static originalResolve: ResolveFilename = AliasNoble.getOriginalResolve();

  public static shim(): void {
    const shim: ResolveFilename = (...args) => AliasNoble.resolveShim(...args);
    AliasNoble.moduleRef._resolveFilename = shim;
  }

  public static unshim(): void {
    AliasNoble.moduleRef._resolveFilename = AliasNoble.originalResolve;
  }

  private static resolveShim(
    request: string,
    parentModule: BuiltinModule,
    isMain: boolean
  ): any {
    for (const [matches, replacement] of AliasNoble.replacements) {
      if (matches.includes(request)) request = replacement;
    }
    return AliasNoble.originalResolve(request, parentModule, isMain);
  }

  private static getModule(): AliasModule {
    if (module.constructor.length > 1) return module.constructor as any;
    return BuiltinModule as any;
  }

  private static getOriginalResolve(): ResolveFilename {
    return AliasNoble.getModule()._resolveFilename;
  }
}

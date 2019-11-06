export class AdapterError extends Error {
  private static issuesPage = "https://github.com/LukasBombach/sblendid/issues";

  constructor(message: string) {
    super(`${message} Please file an issue at ${AdapterError.issuesPage}`);
    this.name = "NodeAdapterError";
  }
}

export class NotInitializedError extends Error {
  constructor(caller: string) {
    super(`You must call init() before you can call ${caller}`);
    this.name = "NotInitializedError";
  }
}

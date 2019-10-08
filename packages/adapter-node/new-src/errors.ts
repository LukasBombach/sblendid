export class AdapterError extends Error {
  constructor(message: string) {
    super(
      `${message} Please file an issue at https://github.com/LukasBombach/sblendid/issues`
    );
    this.name = "NodeAdapterError";
  }
}

export class NotInitializedError extends Error {
  constructor(caller: string) {
    super(`You must call init() before you can call ${caller}`);
    this.name = "NotInitializedError";
  }
}

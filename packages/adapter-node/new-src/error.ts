export default class NodeAdapterError extends Error {
  constructor(message: string) {
    super(
      `${message} Please file an issue at https://github.com/LukasBombach/sblendid/issues`
    );
    this.name = "NodeAdapterError";
  }
}

type Constructor<T = IBindings> = new (...args: any[]) => T;

export default function getAdapter<TBindings extends Constructor>(Bindings: TBindings) {
  return class Adapter extends Bindings {
    async run<E extends Event>(action: Action, when: When<E>, end?: End): Promise<Params<E>> {
      const [eventParameters] = await Promise.all([when(), action()]);
      if (end) await end();
      return eventParameters;
    }

    // todo fucking any
    public when<E extends Event>(event: E, filter: Condition<E>): Promise<Params<E>> {
      const multiArgs = true;
      return promisedEvent<E, Params<E>>(this as any, event, { filter, multiArgs } as any);
    }
  };
}

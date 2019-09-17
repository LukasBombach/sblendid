import { events, Event } from "../utils/types";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeEvent(argument: Event): R;
    }
  }
}

expect.extend({
  toBeEvent(received: any, argument: Event) {
    if (typeof events[argument] === "undefined") {
      return {
        message: () => `event "${argument}" cannot be emitted by sblendid`,
        pass: false
      };
    }

    const { error } = events[argument].validate(received);

    return error
      ? {
          message: () => `expected ${received} to match the event ${argument}`,
          pass: false
        }
      : {
          message: () =>
            `expected ${received} not to match the event ${argument}`,
          pass: true
        };
  }
});

import util from "util";
import { events, Event } from "../utils/types";

declare global {
  namespace jest {
    interface Matchers<R, T> {
      toBeEvent(argument: Event): R;
    }
  }
}

const i = (data: any) => util.inspect(data, { depth: 10 });

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
          message: () => `expected ${i(received)} to match the event ${argument}
          
          ${error.message}
          `,
          pass: false
        }
      : {
          message: () =>
            `expected ${received} not to match the event ${argument}`,
          pass: true
        };
  }
});

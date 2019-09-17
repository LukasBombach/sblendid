import { AnySchema, ValidationOptions } from "@hapi/joi";

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchSchema(schema: AnySchema, options?: ValidationOptions): R;
    }
  }
}

expect.extend({
  toMatchSchema(received: any, schema: AnySchema, options?: ValidationOptions) {
    const validationResult = schema.validate(received, options);
    const pass = !validationResult.error;

    if (pass) {
      return {
        message: () => "expected not to match schema",
        pass: true
      };
    } else {
      return {
        message: () => "expected to match schema",
        pass: false
      };
    }
  }
});

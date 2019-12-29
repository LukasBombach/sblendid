import { AnySchema, ValidationOptions } from "@hapi/joi";

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

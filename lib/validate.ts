/**
 * ─── Zod Validation Middleware ─────────────────────────────────────────────
 * Validates incoming request body/query against a Zod schema.
 * Returns 422 with field-level error details on failure.
 *
 * Pattern adapted from: MERN_Boilerplates/node-api-boilerplate/src/middleware/validator.middleware.js
 *
 * Usage (in Next.js Route Handlers):
 *   const body = await validate(registerSchema, await req.json());
 *   // body is the parsed + coerced result — throws AppError on failure
 */
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../lib/AppError";

/**
 * Validates data against a Zod schema.
 * @throws AppError(422) with validation errors if schema fails
 * @returns The parsed (coerced) data
 */
export async function validate<T>(schema: ZodSchema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      throw new AppError("Validation failed", 422, errors);
    }
    throw error;
  }
}

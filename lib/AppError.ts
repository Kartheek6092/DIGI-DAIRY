/**
 * ─── AppError ──────────────────────────────────────────────────────────────
 * Custom operational error class. Throw this for all known API errors.
 * The route handler wrapper extracts statusCode and message from it.
 *
 * Pattern adapted from: MERN_Boilerplates/node-api-boilerplate/src/utils/AppError.js
 *
 * Usage:
 *   throw new AppError("Email already registered", 409);
 *   throw new AppError("Validation failed", 422, [{ field: "email", message: "..." }]);
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[] | null;
  public readonly isOperational: boolean;

  /**
   * @param message    Human-readable error message
   * @param statusCode HTTP status code (400, 401, 403, 404, 409, 422, 500…)
   * @param errors     Optional validation error details array
   */
  constructor(message: string, statusCode = 500, errors: unknown[] | null = null) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Distinguishes from programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}

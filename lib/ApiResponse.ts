/**
 * ─── ApiResponse ───────────────────────────────────────────────────────────
 * Standardised response shape for all Next.js Route Handlers.
 *
 * Success: { data, code, message }
 * Error:   { code, message [, errors] }
 *
 * Pattern adapted from: MERN_Boilerplates/node-api-boilerplate/src/utils/response.js
 *
 * Usage:
 *   return ApiResponse.success(data, "Created successfully", 201);
 *   return ApiResponse.error("Not found", 404);
 *   return ApiResponse.paginated(items, total, page, pageSize);
 */
import { NextResponse } from "next/server";
import { AppError } from "./AppError";
import { config } from "./config";

export interface ValidationError {
  field: string;
  message: string;
}

export class ApiResponse {
  /** Send a success response. */
  static success<T>(data: T, message = "Success", code = 200): NextResponse {
    return NextResponse.json({ data, code, message }, { status: code });
  }

  /** Send an error response. */
  static error(
    message = "An error occurred",
    code = 400,
    errors: ValidationError[] | null = null
  ): NextResponse {
    const body: Record<string, unknown> = { code, message };
    if (errors) body.errors = errors;
    return NextResponse.json(body, { status: code });
  }

  /** Send a paginated list response. */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    message = "Success"
  ): NextResponse {
    return NextResponse.json(
      {
        data,
        code: 200,
        message,
        pagination: {
          total,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(total / pageSize),
        },
      },
      { status: 200 }
    );
  }

  /**
   * Route handler wrapper — catches AppError and unexpected errors.
   * Adapts the boilerplate errorHandler middleware pattern for Next.js.
   *
   * Usage:
   *   export const POST = ApiResponse.wrap(async (req) => {
   *     const data = await someService.doThing();
   *     return ApiResponse.success(data, "Done", 201);
   *   });
   */
  static wrap(
    handler: (req: any, ctx?: any) => Promise<NextResponse>
  ) {
    return async (req: any, ctx?: any): Promise<NextResponse> => {
      try {
        return await handler(req, ctx);
      } catch (err) {
        // ─── Operational AppError ────────────────────────────────────
        if (err instanceof AppError) {
          return ApiResponse.error(err.message, err.statusCode, err.errors as ValidationError[]);
        }

        // ─── Zod validation error (rethrown from validate()) ─────────
        if (
          err &&
          typeof err === "object" &&
          (err as { name?: string }).name === "ZodError"
        ) {
          const zodErr = err as { issues: { path: string[]; message: string }[] };
          const errors = zodErr.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }));
          return ApiResponse.error("Validation failed", 422, errors);
        }

        // ─── Mongoose duplicate key ───────────────────────────────────
        if (
          err &&
          typeof err === "object" &&
          (err as { code?: number }).code === 11000
        ) {
          return ApiResponse.error("Duplicate entry — record already exists", 409);
        }

        // ─── Generic 500 ─────────────────────────────────────────────
        const message = config.IS_PROD
          ? "Internal server error"
          : (err instanceof Error ? err.message : "Unknown error");
        return ApiResponse.error(message, 500);
      }
    };
  }
}

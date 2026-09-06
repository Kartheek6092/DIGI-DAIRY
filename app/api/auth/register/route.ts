import { NextRequest } from "next/server";
import { ApiResponse } from "../../../../lib/ApiResponse";
import { AppError } from "../../../../lib/AppError";
import { validate } from "../../../../lib/validate";
import { registerSchema } from "../../../../lib/validation/auth.schema";
import { authService } from "../../../../services/auth.service";
import { connectDB } from "../../../../lib/db";
import { checkRateLimit } from "../../../../lib/rateLimit";

export const POST = ApiResponse.wrap(async (req: NextRequest) => {
  // 1. Rate limiting (by IP)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  await checkRateLimit(ip);

  // 2. Parse & Validate body
  const body = await validate(registerSchema, await req.json());

  // 3. Connect DB
  await connectDB();

  // 4. Business logic
  const user = await authService.register(body);

  // 5. Respond
  return ApiResponse.success(user, "User registered successfully", 201);
});

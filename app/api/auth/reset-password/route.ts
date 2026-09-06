import { NextRequest } from "next/server";
import { ApiResponse } from "../../../../lib/ApiResponse";
import { AppError } from "../../../../lib/AppError";
import { validate } from "../../../../lib/validate";
import { resetPasswordSchema } from "../../../../lib/validation/auth.schema";
import { connectDB } from "../../../../lib/db";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { userRepository } from "../../../../repositories/user.repository";
import { passwordResetTokenRepository } from "../../../../repositories/passwordResetToken.repository";
import { auditLogRepository } from "../../../../repositories/auditLog.repository";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export const POST = ApiResponse.wrap(async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  await checkRateLimit(ip);

  const body = await validate(resetPasswordSchema, await req.json());

  await connectDB();

  const tokenHash = crypto.createHash("sha256").update(body.token).digest("hex");
  const tokenDoc = await passwordResetTokenRepository.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (!tokenDoc) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const user = await userRepository.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  // Update password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(body.password, salt);

  await userRepository.updateById(user._id, { passwordHash });

  // Mark token as used
  await passwordResetTokenRepository.updateById(tokenDoc._id, { used: true });

  await auditLogRepository.logAction(user._id.toString(), "password_changed", ip);

  return ApiResponse.success(null, "Password reset successfully.");
});

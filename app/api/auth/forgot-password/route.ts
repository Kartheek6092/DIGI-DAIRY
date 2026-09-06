import { NextRequest } from "next/server";
import { ApiResponse } from "../../../../lib/ApiResponse";
import { validate } from "../../../../lib/validate";
import { forgotPasswordSchema } from "../../../../lib/validation/auth.schema";
import { connectDB } from "../../../../lib/db";
import { checkRateLimit } from "../../../../lib/rateLimit";
import { userRepository } from "../../../../repositories/user.repository";
import { passwordResetTokenRepository } from "../../../../repositories/passwordResetToken.repository";
import { auditLogRepository } from "../../../../repositories/auditLog.repository";
import crypto from "crypto";
// import { sendEmail } from "../../../../lib/email"; // Placeholder for email service

export const POST = ApiResponse.wrap(async (req: NextRequest) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  await checkRateLimit(ip);

  const body = await validate(forgotPasswordSchema, await req.json());

  await connectDB();

  const user = await userRepository.findByEmail(body.email);
  if (!user) {
    // For security reasons, don't reveal that the user doesn't exist
    return ApiResponse.success(null, "If an account exists, a password reset link has been sent.");
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Invalidate previous tokens
  await passwordResetTokenRepository.invalidateTokensForUser(user._id.toString());

  // Save new token
  await passwordResetTokenRepository.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  await auditLogRepository.logAction(user._id.toString(), "password_reset_requested", ip);

  // Send Email (simulated for now)
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
  console.log("SIMULATED EMAIL TO:", user.email, "URL:", resetUrl);
  // await sendEmail(user.email, "Password Reset", `Click here to reset your password: ${resetUrl}`);

  return ApiResponse.success(null, "If an account exists, a password reset link has been sent.");
});

import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";
import { AppError } from "../lib/AppError";
import { config } from "../lib/config";
import { IUser } from "../models/User";

export class AuthService {
  async register(data: { name: string; email: string; password?: string; authProvider?: "credentials" | "google" }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("Email already registered", 409);
    }

    let passwordHash = undefined;
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(data.password, salt);
    } else if (!data.authProvider || data.authProvider === "credentials") {
      throw new AppError("Password is required for credentials authentication", 400);
    }

    const newUser = await userRepository.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash,
      authProvider: data.authProvider || "credentials",
      emailVerified: data.authProvider === "google",
    });

    await auditLogRepository.logAction(newUser._id.toString(), "register_success");

    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    };
  }

  async login(email: string, password?: string, ip?: string, userAgent?: string): Promise<IUser> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't leak whether the user exists or not
      throw new AppError("Invalid email or password", 401);
    }

    if (user.authProvider !== "credentials") {
      throw new AppError(`Please sign in with your ${user.authProvider} account`, 401);
    }

    if (!password || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      await auditLogRepository.logAction(user._id.toString(), "login_failed_locked", ip, userAgent);
      throw new AppError("Account locked. Try again later.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      await userRepository.incrementFailedLogins(email);
      // Fetch user again to get updated failed logins count
      const updatedUser = await userRepository.findByEmail(email);
      
      if (updatedUser && updatedUser.failedLoginAttempts >= config.MAX_FAILED_LOGINS) {
        const lockUntil = new Date(Date.now() + config.LOCK_DURATION_MINUTES * 60 * 1000);
        await userRepository.lockAccount(email, lockUntil);
        await auditLogRepository.logAction(user._id.toString(), "account_locked", ip, userAgent);
      } else {
        await auditLogRepository.logAction(user._id.toString(), "login_failed", ip, userAgent);
      }
      
      throw new AppError("Invalid email or password", 401);
    }

    // Success
    await userRepository.clearLock(email);
    await userRepository.updateLastLogin(user._id.toString());
    await auditLogRepository.logAction(user._id.toString(), "login_success", ip, userAgent);

    return user;
  }
}

export const authService = new AuthService();

/**
 * ─── Environment Config ────────────────────────────────────────────────────
 * Single source of truth for all environment variables.
 * Import from this file everywhere — never use process.env directly.
 *
 * Pattern adapted from: MERN_Boilerplates/node-api-boilerplate/src/config/index.js
 */

export const config = {
  // ─── App ──────────────────────────────────────────────────
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PROD: process.env.NODE_ENV === "production",
  APP_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // ─── Database ─────────────────────────────────────────────
  MONGODB_URI: process.env.MONGODB_URI || "",

  // ─── Auth.js (NextAuth) ───────────────────────────────────
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",

  // ─── Upstash Redis (Rate Limiting) ────────────────────────
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",

  // ─── Email (Nodemailer) ───────────────────────────────────
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || "587"),
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD || "",
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Digi-Dairy",

  // ─── Account Lockout ──────────────────────────────────────
  MAX_FAILED_LOGINS: parseInt(process.env.MAX_FAILED_LOGINS || "5"),
  LOCK_DURATION_MINUTES: parseInt(process.env.LOCK_DURATION_MINUTES || "15"),

  // ─── Password Reset ───────────────────────────────────────
  RESET_TOKEN_EXPIRY_MINUTES: parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES || "30"),

  // ─── Rate Limits ──────────────────────────────────────────
  AUTH_RATE_LIMIT_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_REQUESTS || "10"),
  AUTH_RATE_LIMIT_WINDOW_SECONDS: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS || "900"), // 15 min
} as const;

export type Config = typeof config;

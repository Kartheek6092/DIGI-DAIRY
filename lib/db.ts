/**
 * ─── Mongoose Connection Singleton ─────────────────────────────────────────
 * Caches the Mongoose connection across serverless function calls to
 * avoid opening a new connection on every hot-reload / cold-start.
 *
 * Usage:
 *   import connectDB from "@/lib/db";
 *   await connectDB();
 */
import mongoose from "mongoose";
import { config } from "./config";

declare global {
  // Allow global caching across hot reloads in dev
  // eslint-disable-next-line no-var
  var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const globalWithMongoose = global as typeof globalThis & {
  __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!globalWithMongoose.__mongoose) {
  globalWithMongoose.__mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.__mongoose;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!config.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.MONGODB_URI, {
      bufferCommands: false,
    });
    console.log(`config.MONGODB_URI: ${config.MONGODB_URI}`);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;

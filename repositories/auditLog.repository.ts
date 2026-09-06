import { BaseRepository } from "./base.repository";
import AuditLog, { IAuditLog } from "../models/AuditLog";
import { Types } from "mongoose";

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }

  async logAction(userId: string | Types.ObjectId, action: string, ip?: string, userAgent?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.create({
      userId: new Types.ObjectId(userId.toString()),
      action,
      ip,
      userAgent,
      metadata
    });
  }
}

export const auditLogRepository = new AuditLogRepository();

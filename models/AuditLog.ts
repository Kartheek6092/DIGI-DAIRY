import { Schema, model, models, Document, Types } from "mongoose";

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  action: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, required: true }, // login_success | login_failed | password_changed | entry_saved | entry_deleted
  ip: { type: String },
  userAgent: { type: String },
  metadata: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
});

export default models.AuditLog || model<IAuditLog>("AuditLog", AuditLogSchema);

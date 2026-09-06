import { Schema, model, models, Document, Types } from "mongoose";

export interface IDiaryEntry extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  title?: string;
  content: Record<string, unknown>; // TipTap/ProseMirror JSON
  plainTextPreview?: string;
  tags?: string[];
  version: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DiaryEntrySchema = new Schema<IDiaryEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    title: { type: String, maxlength: 200 },
    content: { type: Schema.Types.Mixed, required: true },
    plainTextPreview: { type: String, maxlength: 300 },
    tags: [{ type: String, maxlength: 30 }],
    version: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Fast lookup: all entries for a user on a date
DiaryEntrySchema.index({ userId: 1, date: 1 });
// Fast calendar dot query: distinct dates in a month
DiaryEntrySchema.index({ userId: 1, date: 1, _id: 1 });

export default models.DiaryEntry || model<IDiaryEntry>("DiaryEntry", DiaryEntrySchema);

import { BaseRepository } from "./base.repository";
import DiaryEntry, { IDiaryEntry } from "../models/DiaryEntry";
import { Types } from "mongoose";

export class DiaryEntryRepository extends BaseRepository<IDiaryEntry> {
  constructor() {
    super(DiaryEntry);
  }

  async findByDate(userId: string | Types.ObjectId, date: string): Promise<IDiaryEntry[]> {
    return this.model.find({ userId, date }).sort({ order: 1, createdAt: 1 }).exec();
  }

  async distinctDatesInMonth(userId: string | Types.ObjectId, monthPrefix: string): Promise<string[]> {
    // monthPrefix should be "YYYY-MM"
    // We want to match all dates that start with "YYYY-MM-"
    return this.model.distinct("date", {
      userId,
      date: { $regex: `^${monthPrefix}-` }
    }).exec();
  }

  // Find all entries for a specific month (useful for a detailed list view of a month)
  async findByMonth(userId: string | Types.ObjectId, monthPrefix: string): Promise<IDiaryEntry[]> {
    return this.model.find({
      userId,
      date: { $regex: `^${monthPrefix}-` }
    }).sort({ date: 1, order: 1, createdAt: 1 }).exec();
  }

  async findAllByUserId(userId: string | Types.ObjectId): Promise<IDiaryEntry[]> {
    return this.model.find({ userId }).sort({ date: -1, order: 1, createdAt: 1 }).exec();
  }
}

export const diaryEntryRepository = new DiaryEntryRepository();

import { diaryEntryRepository } from "../repositories/diaryEntry.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";
import { AppError } from "../lib/AppError";
import { IDiaryEntry } from "../models/DiaryEntry";
import { Types } from "mongoose";

export class EntryService {
  async getCalendarDots(userId: string, month: string): Promise<string[]> {
    // month format should be "YYYY-MM"
    return diaryEntryRepository.distinctDatesInMonth(userId, month);
  }

  async getEntriesByDate(userId: string, date: string): Promise<IDiaryEntry[]> {
    return diaryEntryRepository.findByDate(userId, date);
  }

  async getAllEntries(userId: string): Promise<IDiaryEntry[]> {
    return diaryEntryRepository.findAllByUserId(userId);
  }

  async getEntryById(userId: string, entryId: string): Promise<IDiaryEntry> {
    const entry = await diaryEntryRepository.findById(entryId);
    if (!entry) {
      throw new AppError("Entry not found", 404);
    }
    if (entry.userId.toString() !== userId) {
      throw new AppError("Unauthorized access to entry", 403);
    }
    return entry;
  }

  async createEntry(
    userId: string,
    data: { date: string; title?: string; content: Record<string, unknown>; plainTextPreview?: string; tags?: string[] }
  ): Promise<IDiaryEntry> {
    // Get existing entries for this date to determine the order
    const existingEntries = await diaryEntryRepository.findByDate(userId, data.date);
    const order = existingEntries.length > 0 ? existingEntries[existingEntries.length - 1].order + 1 : 0;

    const entry = await diaryEntryRepository.create({
      userId: new Types.ObjectId(userId),
      date: data.date,
      title: data.title || "",
      content: data.content,
      plainTextPreview: data.plainTextPreview || "",
      tags: data.tags || [],
      order,
      version: 1
    });

    await auditLogRepository.logAction(userId, "entry_created", undefined, undefined, { entryId: entry._id.toString() });
    return entry;
  }

  async updateEntry(
    userId: string,
    entryId: string,
    data: { title?: string; content?: Record<string, unknown>; plainTextPreview?: string; tags?: string[] },
    version: number
  ): Promise<IDiaryEntry> {
    // Check ownership first
    await this.getEntryById(userId, entryId);

    const updatedEntry = await diaryEntryRepository.updateOne(
      { _id: new Types.ObjectId(entryId), userId: new Types.ObjectId(userId), version },
      { 
        $set: { ...data },
        $inc: { version: 1 } 
      }
    );

    if (!updatedEntry) {
      // It either doesn't exist, doesn't belong to the user (checked above, but still), OR the version mismatched
      throw new AppError("Failed to update entry. It may have been modified by another device.", 409);
    }

    await auditLogRepository.logAction(userId, "entry_updated", undefined, undefined, { entryId: entryId });
    return updatedEntry;
  }

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    // Check ownership
    await this.getEntryById(userId, entryId);
    
    await diaryEntryRepository.deleteById(entryId);
    await auditLogRepository.logAction(userId, "entry_deleted", undefined, undefined, { entryId: entryId });
  }
}

export const entryService = new EntryService();

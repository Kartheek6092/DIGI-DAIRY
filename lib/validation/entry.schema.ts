import { z } from "zod";

export const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Must be YYYY-MM-DD"),
  title: z.string().max(200).optional(),
  content: z.record(z.string(), z.unknown()), // TipTap JSON format
  plainTextPreview: z.string().max(300).optional(),
  tags: z.array(z.string().max(30)).optional(),
});

export const entryUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  plainTextPreview: z.string().max(300).optional(),
  tags: z.array(z.string().max(30)).optional(),
  version: z.number().int().positive("Version must be provided for optimistic concurrency"),
});

export type EntryInput = z.infer<typeof entrySchema>;
export type EntryUpdateInput = z.infer<typeof entryUpdateSchema>;

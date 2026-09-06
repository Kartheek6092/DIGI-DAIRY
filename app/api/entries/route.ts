import { NextRequest } from "next/server";
import { ApiResponse } from "../../../lib/ApiResponse";
import { AppError } from "../../../lib/AppError";
import { validate } from "../../../lib/validate";
import { entrySchema } from "../../../lib/validation/entry.schema";
import { entryService } from "../../../services/entry.service";
import { connectDB } from "../../../lib/db";
import { auth } from "../../../lib/auth";

export const GET = ApiResponse.wrap(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // Format: YYYY-MM
  
  await connectDB();

  if (month) {
    // Return distinct dates for calendar dots
    const dates = await entryService.getCalendarDots(session.user.id, month);
    return ApiResponse.success(dates, "Calendar dots fetched successfully");
  }

  throw new AppError("Missing required query parameter: month", 400);
});

export const POST = ApiResponse.wrap(async (req: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const body = await validate(entrySchema, await req.json());

  await connectDB();

  const entry = await entryService.createEntry(session.user.id, {
    date: body.date,
    title: body.title,
    content: body.content,
    plainTextPreview: body.plainTextPreview,
    tags: body.tags
  });

  return ApiResponse.success(entry, "Diary entry created successfully", 201);
});

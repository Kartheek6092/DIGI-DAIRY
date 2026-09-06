import { NextRequest } from "next/server";
import { ApiResponse } from "../../../../lib/ApiResponse";
import { AppError } from "../../../../lib/AppError";
import { validate } from "../../../../lib/validate";
import { entryUpdateSchema } from "../../../../lib/validation/entry.schema";
import { entryService } from "../../../../services/entry.service";
import { connectDB } from "../../../../lib/db";
import { auth } from "../../../../lib/auth";

type Context = { params: Promise<{ entryId: string }> };

export const GET = ApiResponse.wrap(async (req: NextRequest, ctx: any) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { entryId } = await (ctx as Context).params;

  await connectDB();
  const entry = await entryService.getEntryById(session.user.id, entryId);

  return ApiResponse.success(entry, "Diary entry fetched successfully");
});

export const PATCH = ApiResponse.wrap(async (req: NextRequest, ctx: any) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { entryId } = await (ctx as Context).params;
  const body = await validate(entryUpdateSchema, await req.json());

  await connectDB();
  
  const updatedEntry = await entryService.updateEntry(
    session.user.id, 
    entryId, 
    {
      title: body.title,
      content: body.content,
      plainTextPreview: body.plainTextPreview,
      tags: body.tags
    },
    body.version
  );

  return ApiResponse.success(updatedEntry, "Diary entry updated successfully");
});

export const DELETE = ApiResponse.wrap(async (req: NextRequest, ctx: any) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError("Unauthorized", 401);
  }

  const { entryId } = await (ctx as Context).params;

  await connectDB();
  await entryService.deleteEntry(session.user.id, entryId);

  return ApiResponse.success(null, "Diary entry deleted successfully");
});

import { auth } from "@/lib/auth";
import { entryService } from "@/services/entry.service";
import { connectDB } from "@/lib/db";
import { redirect } from "next/navigation";
import { DiaryEditor } from "@/components/editor/DiaryEditor";
import Link from "next/link";

export const metadata = {
  title: "Editor - Digi-Dairy",
};

export default async function DiaryEditorPage({
  params,
}: {
  params: Promise<{ date: string; entryId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { date, entryId } = await params;
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    redirect("/calendar");
  }

  await connectDB();
  
  try {
    const entry = await entryService.getEntryById(session.user.id, entryId);
    
    // Ensure the entry belongs to the date in the URL
    if (entry.date !== date) {
      redirect(`/diary/${entry.date}/${entryId}`);
    }

    return (
      <div className="w-full h-full relative">
        <Link 
          href={`/diary/${date}`}
          className="absolute -top-12 left-0 flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {date}
        </Link>
        
        <DiaryEditor 
          entryId={entryId}
          initialTitle={entry.title || ""}
          initialContent={entry.content}
          initialVersion={entry.version}
        />
      </div>
    );
  } catch (error) {
    // If not found or unauthorized, redirect back
    redirect(`/diary/${date}`);
  }
}

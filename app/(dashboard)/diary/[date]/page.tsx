import { auth } from "@/lib/auth";
import { entryService } from "@/services/entry.service";
import { connectDB } from "@/lib/db";
import { format, parseISO } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { NewEntryButton } from "@/components/editor/NewEntryButton";

export const metadata = {
  title: "Diary Entries - Digi-Dairy",
};

export default async function DiaryDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { date } = await params;
  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    redirect("/calendar");
  }

  await connectDB();
  const entries = await entryService.getEntriesByDate(session.user.id, date);

  const displayDate = format(parseISO(date), "EEEE, MMMM d, yyyy");

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/calendar"
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {displayDate}
          </h1>
        </div>
        
        <NewEntryButton date={date} />
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No entries yet</h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
            You haven't written anything for this day. Click the button below to start your first entry.
          </p>
          <NewEntryButton date={date} label="Start Writing" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry._id.toString()}
              href={`/diary/${date}/${entry._id}`}
              className="group block p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {entry.title || "Untitled Entry"}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 flex-grow line-clamp-3">
                  {entry.plainTextPreview || "No preview available..."}
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>{format(new Date(entry.createdAt), "h:mm a")}</span>
                  <span className="flex items-center text-indigo-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                    Read more <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

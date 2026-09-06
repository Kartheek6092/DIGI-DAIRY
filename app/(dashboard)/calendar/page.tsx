import { auth } from "@/lib/auth";
import { entryService } from "@/services/entry.service";
import { CalendarView } from "@/components/calendar/CalendarView";
import { format, parseISO } from "date-fns";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Link from "next/link";
import { IDiaryEntry } from "@/models/DiaryEntry";

export const metadata = {
  title: "Calendar - Digi-Dairy",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  
  // Validate and format month parameter
  let month = typeof params.month === "string" ? params.month : format(new Date(), "yyyy-MM");
  if (!/^\d{4}-\d{2}$/.test(month)) {
    month = format(new Date(), "yyyy-MM");
  }

  await connectDB();
  
  // Fetch dates that have entries for the current month
  const dots = await entryService.getCalendarDots(session.user.id, month);

  // Fetch all entries for the right-hand side list
  const allEntries = await entryService.getAllEntries(session.user.id);
  
  // Group entries by year
  const entriesByYear = allEntries.reduce((acc, entry) => {
    const year = entry.date.substring(0, 4);
    if (!acc[year]) acc[year] = [];
    acc[year].push(entry);
    return acc;
  }, {} as Record<string, IDiaryEntry[]>);
  
  const sortedYears = Object.keys(entriesByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Left Column: Calendar */}
      <div className="flex-1 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Your Journal</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Select a date to read or write entries.</p>
        </div>
        
        <CalendarView initialMonth={month} dots={dots} />
      </div>

      {/* Right Column: All Entries List */}
      <div className="w-full lg:w-96 flex flex-col gap-4 lg:border-l border-zinc-200 dark:border-zinc-800 lg:pl-8 pt-8 lg:pt-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">All Entries</h2>
          <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full">
            {allEntries.length} Total
          </span>
        </div>
        
        <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
          {sortedYears.length === 0 ? (
            <div className="text-center p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              <p className="text-zinc-500 text-sm">No entries yet.</p>
              <p className="text-zinc-400 text-xs mt-1">Start writing to see them here.</p>
            </div>
          ) : (
            sortedYears.map(year => (
              <div key={year} className="space-y-3">
                <h3 className="font-semibold text-sm tracking-wider text-zinc-900 dark:text-zinc-100 sticky top-0 bg-zinc-50 dark:bg-zinc-950 py-2 z-10 border-b border-zinc-200 dark:border-zinc-800/50 uppercase">
                  {year}
                </h3>
                <ul className="space-y-3">
                  {entriesByYear[year].map(entry => (
                    <li key={entry._id.toString()}>
                      <Link 
                        href={`/diary/${entry.date}/${entry._id.toString()}`}
                        className="block p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md transition-all group"
                      >
                        <div className="flex justify-between items-baseline mb-2 gap-2">
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate flex-1">
                            {entry.title || "Untitled Entry"}
                          </span>
                          <span className="text-xs font-medium text-zinc-500 whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                            {format(parseISO(entry.date), "MMM d")}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {entry.plainTextPreview || "No content preview available..."}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CalendarViewProps {
  initialMonth: string; // YYYY-MM
  dots: string[]; // YYYY-MM-DD
}

export function CalendarView({ initialMonth, dots }: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(() => {
    return initialMonth ? parseISO(`${initialMonth}-01`) : new Date();
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the start of the month with empty days to align with weekday columns
  const startDay = monthStart.getDay(); // 0 is Sunday
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  const nextMonth = () => {
    const next = addMonths(currentDate, 1);
    setCurrentDate(next);
    router.push(`/calendar?month=${format(next, "yyyy-MM")}`);
  };

  const prevMonth = () => {
    const prev = subMonths(currentDate, 1);
    setCurrentDate(prev);
    router.push(`/calendar?month=${format(prev, "yyyy-MM")}`);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    const next = new Date(currentDate.getFullYear(), newMonth, 1);
    setCurrentDate(next);
    router.push(`/calendar?month=${format(next, "yyyy-MM")}`);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    const next = new Date(newYear, currentDate.getMonth(), 1);
    setCurrentDate(next);
    router.push(`/calendar?month=${format(next, "yyyy-MM")}`);
  };

  const hasEntry = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return dots.includes(dateStr);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-white/10 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02]">

        <div className="flex items-center gap-1">
          {/* Month */}
          <select
            value={currentDate.getMonth()}
            onChange={handleMonthChange}
            className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg px-2 py-1 outline-none color-scheme-light dark:color-scheme-dark"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option
                key={i}
                value={i}
                className="text-base font-normal bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {format(new Date(2000, i, 1), "MMMM")}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            value={currentDate.getFullYear()}
            onChange={handleYearChange}
            className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 bg-transparent border-none focus:ring-0 cursor-pointer hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg px-2 py-1 outline-none color-scheme-light dark:color-scheme-dark"
          >
            {Array.from({ length: 30 }).map((_, i) => {
              const y = new Date().getFullYear() - 15 + i;

              return (
                <option
                  key={y}
                  value={y}
                  className="text-base font-normal bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {paddingDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/30 border border-dashed border-zinc-200/50 dark:border-zinc-700/50" />
          ))}

          {daysInMonth.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isTodayDate = isToday(date);
            const hasDots = hasEntry(date);

            return (
              <Link
                key={date.toString()}
                href={`/diary/${dateStr}`}
                className={`group relative h-24 rounded-2xl border p-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isTodayDate
                  ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/30 ring-1 ring-indigo-500/50"
                  : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-md"
                  }`}
              >
                <div className="flex flex-col h-full justify-between">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isTodayDate
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                    }`}>
                    {format(date, "d")}
                  </span>

                  <div className="flex justify-center pb-2">
                    {hasDots && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-sm shadow-indigo-500/50 animate-pulse-slow"></div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

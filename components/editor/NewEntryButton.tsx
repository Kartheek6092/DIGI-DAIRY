"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewEntryButtonProps {
  date: string;
  label?: string;
}

export function NewEntryButton({ date, label = "New Entry" }: NewEntryButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          content: { type: "doc", content: [{ type: "paragraph" }] }, // Empty TipTap doc
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create entry");
      }

      const { data } = await res.json();
      router.push(`/diary/${date}/${data._id}`);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="relative group overflow-hidden rounded-full px-6 py-2.5 font-medium text-white shadow-md shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
        {label}
      </span>
    </button>
  );
}

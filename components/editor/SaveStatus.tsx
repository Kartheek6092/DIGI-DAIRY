export type SaveState = "idle" | "saving" | "saved" | "error";

interface SaveStatusProps {
  status: SaveState;
  lastSavedAt?: Date | null;
}

export function SaveStatus({ status, lastSavedAt }: SaveStatusProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium">
      {status === "saving" && (
        <span className="flex items-center gap-1.5 text-amber-500">
          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </span>
      )}
      
      {status === "saved" && (
        <span className="flex items-center gap-1.5 text-emerald-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Saved {lastSavedAt && `at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        </span>
      )}
      
      {status === "error" && (
        <span className="flex items-center gap-1.5 text-rose-500">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Couldn't save — retrying
        </span>
      )}

      {status === "idle" && lastSavedAt && (
        <span className="text-zinc-400">
          Last saved {lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}

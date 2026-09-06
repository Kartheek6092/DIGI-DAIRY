"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./EditorToolbar";
import { SaveStatus, SaveState } from "./SaveStatus";
import { openDB } from "idb";

interface DiaryEditorProps {
  entryId: string;
  initialTitle: string;
  initialContent: any;
  initialVersion: number;
}

// IndexedDB setup for offline fallback
const dbPromise = typeof window !== 'undefined' ? openDB("digi-dairy-db", 1, {
  upgrade(db) {
    db.createObjectStore("offline-edits", { keyPath: "entryId" });
  },
}) : null;

// Helper to recursively extract plain text from TipTap JSON
const extractTextFromTipTap = (node: any): string => {
  if (!node) return "";
  if (node.type === "text") return node.text || "";
  if (Array.isArray(node.content)) {
    return node.content.map(extractTextFromTipTap).join(" ");
  }
  return "";
};

export function DiaryEditor({ entryId, initialTitle, initialContent, initialVersion }: DiaryEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saveStatus, setSaveStatus] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const currentVersion = useRef(initialVersion);
  
  // Ref to hold the latest content without triggering re-renders
  const latestContent = useRef(initialContent);
  const latestTitle = useRef(initialTitle);
  
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const saveToServer = useCallback(async (contentToSave: any, titleToSave: string) => {
    setSaveStatus("saving");
    
    try {
      // 1. Generate plain text preview
      // Extract text content recursively from TipTap JSON structure
      const plainTextPreview = extractTextFromTipTap(contentToSave).substring(0, 300);

      // 2. Send PATCH request
      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleToSave,
          content: contentToSave,
          plainTextPreview,
          version: currentVersion.current,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          // Version conflict, we should probably fetch the latest and merge,
          // but for simplicity, we'll just force the error state
          throw new Error("Version conflict");
        }
        throw new Error("Failed to save");
      }

      const { data } = await res.json();
      currentVersion.current = data.version; // Update to new version
      
      setSaveStatus("saved");
      setLastSavedAt(new Date());
      
      // Clear offline backup on success
      if (dbPromise) {
        const db = await dbPromise;
        await db.delete("offline-edits", entryId);
      }
      
      // Reset to idle after a few seconds
      setTimeout(() => {
        setSaveStatus((current) => current === "saved" ? "idle" : current);
      }, 3000);

    } catch (err) {
      console.error(err);
      setSaveStatus("error");
      
      // Save to IndexedDB as fallback
      if (dbPromise) {
        const db = await dbPromise;
        await db.put("offline-edits", {
          entryId,
          title: titleToSave,
          content: contentToSave,
          timestamp: new Date().getTime()
        });
      }
    }
  }, [entryId]);

  const triggerSave = useCallback(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    setSaveStatus("saving");
    
    // Debounce save by 1.5 seconds
    saveTimeout.current = setTimeout(() => {
      saveToServer(latestContent.current, latestTitle.current);
    }, 1500);
  }, [saveToServer]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Write your thoughts here...",
      }),
      CharacterCount,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      latestContent.current = editor.getJSON();
      triggerSave();
    },
    editorProps: {
      attributes: {
        class: "prose prose-zinc dark:prose-invert max-w-none focus:outline-none min-h-[500px] pl-16 pr-8 py-8 font-handwriting text-2xl leading-[32px] prose-p:my-0 prose-headings:my-0 bg-transparent relative z-10 text-slate-800 dark:text-slate-200",
      },
    },
  });

  // Handle Title Change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    latestTitle.current = e.target.value;
    triggerSave();
  };

  // Sync offline edits on mount if there are any
  useEffect(() => {
    async function syncOffline() {
      if (!dbPromise || !editor) return;
      
      try {
        const db = await dbPromise;
        const offlineEdit = await db.get("offline-edits", entryId);
        
        if (offlineEdit && offlineEdit.timestamp > new Date(lastSavedAt || 0).getTime()) {
          // We have a more recent offline edit!
          setTitle(offlineEdit.title);
          latestTitle.current = offlineEdit.title;
          
          editor.commands.setContent(offlineEdit.content);
          latestContent.current = offlineEdit.content;
          
          // Try saving to server immediately
          saveToServer(offlineEdit.content, offlineEdit.title);
        }
      } catch (err) {
        console.error("Failed to sync offline edits", err);
      }
    }
    
    syncOffline();
  }, [entryId, editor, saveToServer, lastSavedAt]);

  // Clean up timeout
  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Title Input & Save Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Entry"
          className="text-4xl font-extrabold tracking-tight bg-transparent border-none focus:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 p-0 w-full"
        />
        <div className="flex-shrink-0 bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-zinc-200 dark:border-white/10">
          <SaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="flex-1 bg-[#fdfbf7] dark:bg-[#1c1b18] rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-[#eaddc4] dark:border-white/5 overflow-hidden flex flex-col relative">
        {/* Red Margin Line */}
        <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-400/40 dark:bg-red-900/40 z-0 pointer-events-none"></div>
        
        {/* Blue Horizontal Lines */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none mt-[65px]" 
          style={{ 
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(59, 130, 246, 0.15) 31px, rgba(59, 130, 246, 0.15) 32px)'
          }}
        ></div>
        
        <div className="relative z-10 bg-white/50 dark:bg-black/20 backdrop-blur-md border-b border-[#eaddc4] dark:border-white/5">
          <EditorToolbar editor={editor} />
        </div>
        
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          <EditorContent editor={editor} />
        </div>
        
        {/* Footer info (Word count, etc) */}
        <div className="p-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] text-xs text-zinc-400 font-medium flex justify-end">
          {editor?.storage.characterCount.words()} words
        </div>
      </div>
    </div>
  );
}

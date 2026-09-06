import { type Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleHeading = (level: 1 | 2 | 3) => editor.chain().focus().toggleHeading({ level }).run();

  const ToolbarButton = ({ onClick, isActive, children }: { onClick: () => void, isActive: boolean, children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isActive 
          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300" 
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-t-3xl">
      <ToolbarButton onClick={() => toggleHeading(1)} isActive={editor.isActive("heading", { level: 1 })}>
        <span className="font-bold text-sm">H1</span>
      </ToolbarButton>
      <ToolbarButton onClick={() => toggleHeading(2)} isActive={editor.isActive("heading", { level: 2 })}>
        <span className="font-bold text-sm">H2</span>
      </ToolbarButton>
      
      <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1"></div>
      
      <ToolbarButton onClick={toggleBold} isActive={editor.isActive("bold")}>
        <span className="font-bold">B</span>
      </ToolbarButton>
      <ToolbarButton onClick={toggleItalic} isActive={editor.isActive("italic")}>
        <span className="italic">I</span>
      </ToolbarButton>
      <ToolbarButton onClick={toggleUnderline} isActive={editor.isActive("underline")}>
        <span className="underline">U</span>
      </ToolbarButton>
      
      <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1"></div>
      
      <ToolbarButton onClick={toggleBulletList} isActive={editor.isActive("bulletList")}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </ToolbarButton>
      <ToolbarButton onClick={toggleOrderedList} isActive={editor.isActive("orderedList")}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h14M7 12h14M7 18h14M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </ToolbarButton>
    </div>
  );
}

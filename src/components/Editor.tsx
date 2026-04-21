import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { api } from "../lib/api";
import { MarkdownEditor } from "./MarkdownEditor";

export function Editor() {
  const { content, setContent, settings, filePath, fileName, markSaved, isDirty, isMarkdown } =
    useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Refocus when new file is opened
  useEffect(() => {
    textareaRef.current?.focus();
  }, [filePath, fileName]);

  // Debounced auto-save for files that already have a path
  useEffect(() => {
    if (!filePath || !isDirty) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.writeFile(filePath, content);
        markSaved(filePath, fileName);
      } catch {
        // Auto-save silently fails; user can still manual-save
      }
    }, 1800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [content, filePath]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 1;

  if (isMarkdown) {
    return (
      <div className="editor-container">
        <MarkdownEditor content={content} onChange={setContent} settings={settings} />
      </div>
    );
  }

  return (
    <div className="editor-container">
      <div className="editor-scroll">
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          dir="auto"
          placeholder="Start writing..."
          style={{
            fontFamily: `'${settings.font_family}', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace, system-ui, sans-serif`,
            fontSize: `${settings.font_size}px`,
            lineHeight: settings.line_height,
          }}
        />
      </div>
      <div className="status-bar">
        <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
        <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        <span>{content.length} chars</span>
      </div>
    </div>
  );
}

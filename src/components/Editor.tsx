import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { api } from "../lib/api";
import { MarkdownEditor } from "./MarkdownEditor";

export function Editor() {
  const { content, setContent, settings, filePath, fileName, markSaved, isDirty, isMarkdown } =
    useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track when the current file was opened, and the content/path at that moment.
  const openedAtRef = useRef<number>(0);
  const versionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const filePathRef = useRef<string | null>(filePath);
  const contentRef = useRef<string>(content);
  const lastSavedContentRef = useRef<string>(content);

  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { filePathRef.current = filePath; }, [filePath]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Refocus + save version on file open
  useEffect(() => {
    textareaRef.current?.focus();
    openedAtRef.current = Date.now();
    lastSavedContentRef.current = content;

    if (filePath) {
      api.saveVersion(filePath, content).catch(() => {});
    }

    // Start periodic auto-version: after 1h open, every N minutes
    if (versionIntervalRef.current) clearInterval(versionIntervalRef.current);
    if (filePath) {
      const intervalMs = (settings.version_interval_minutes || 10) * 60_000;
      versionIntervalRef.current = setInterval(() => {
        const path = filePathRef.current;
        if (!path) return;
        const openedFor = Date.now() - openedAtRef.current;
        if (openedFor >= 60 * 60_000) {
          api.saveVersion(path, contentRef.current).catch(() => {});
        }
      }, intervalMs);
    }

    return () => {
      if (versionIntervalRef.current) {
        clearInterval(versionIntervalRef.current);
        versionIntervalRef.current = null;
      }
    };
  }, [filePath, fileName]);

  // Debounced auto-save for files that already have a path
  useEffect(() => {
    if (!filePath || !isDirty) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const prevContent = lastSavedContentRef.current;
        await api.saveVersion(filePath, prevContent).catch(() => {});
        await api.writeFile(filePath, content);
        lastSavedContentRef.current = content;
        markSaved(filePath, fileName);
      } catch {
        // Auto-save silently fails; user can still manual-save
      }
    }, 1800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [content, filePath]);

  const handleImagePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const imageItem = Array.from(e.clipboardData.items).find((it) => it.type.startsWith("image/"));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const savedPath = await api.savePastedImage(reader.result as string, filePath ?? null);
        const name = savedPath.replace(/\\/g, "/").split("/").pop() || "image.png";
        const ta = textareaRef.current;
        const s = ta ? ta.selectionStart : content.length;
        const insert = `![image](./${name})`;
        setContent(content.substring(0, s) + insert + content.substring(s));
      } catch {}
    };
    reader.readAsDataURL(file);
  };

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
          onPaste={handleImagePaste}
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

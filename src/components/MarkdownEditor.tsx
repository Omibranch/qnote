import { useRef, useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  Code, Link, ImageIcon, Quote,
  List, ListOrdered, Minus, Table,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import type { Settings } from "../store/useStore";
import { useStore } from "../store/useStore";
import { api } from "../lib/api";

interface Props {
  content: string;
  onChange: (v: string) => void;
  settings: Settings;
}

type Tab = "preview" | "code";

export function MarkdownEditor({ content, onChange, settings }: Props) {
  const { filePath } = useStore();
  const [tab, setTab] = useState<Tab>("preview");
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    taRef.current?.focus();
  }, [tab]);

  // Insert inline wrap: **text** or *text* etc.
  const wrap = useCallback((prefix: string, suffix = prefix, placeholder = "text") => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.substring(s, e) || placeholder;
    const next = value.substring(0, s) + prefix + sel + suffix + value.substring(e);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + prefix.length, s + prefix.length + sel.length);
    });
  }, [onChange]);

  // Prepend prefix to the current line
  const prependLine = useCallback((prefix: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.substring(0, lineStart) + prefix + value.substring(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + prefix.length, s + prefix.length);
    });
  }, [onChange]);

  // Insert at cursor (block-level stuff like tables, hr)
  const insertBlock = useCallback((text: string) => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, value } = ta;
    const next = value.substring(0, s) + text + value.substring(s);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + text.length, s + text.length);
    });
  }, [onChange]);

  const insertLink = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.substring(s, e) || "link text";
    const inserted = `[${sel}](url)`;
    const next = value.substring(0, s) + inserted + value.substring(e);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      // Select "url" placeholder
      const urlStart = s + sel.length + 3;
      ta.setSelectionRange(urlStart, urlStart + 3);
    });
  }, [onChange]);

  const insertImage = useCallback(() => {
    const ta = taRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.substring(s, e) || "alt text";
    const inserted = `![${sel}](url)`;
    const next = value.substring(0, s) + inserted + value.substring(e);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      const urlStart = s + sel.length + 4;
      ta.setSelectionRange(urlStart, urlStart + 3);
    });
  }, [onChange]);

  const onPaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
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
        const ta = taRef.current;
        const s = ta ? ta.selectionStart : content.length;
        const md = `![image](./${name})`;
        onChange(content.substring(0, s) + md + content.substring(s));
      } catch {}
    };
    reader.readAsDataURL(file);
  }, [content, onChange, filePath]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!ctrl) return;
    if (e.code === "KeyB") { e.preventDefault(); wrap("**", "**", "bold"); }
    else if (e.code === "KeyI") { e.preventDefault(); wrap("*", "*", "italic"); }
    else if (e.code === "KeyK") { e.preventDefault(); insertLink(); }
    else if (e.code === "Backquote") { e.preventDefault(); wrap("`", "`", "code"); }
  }, [wrap, insertLink]);

  const onSourceScroll = useCallback(() => {
    if (syncingRef.current) return;
    const ta = taRef.current;
    const pane = previewPaneRef.current;
    if (!ta || !pane) return;
    const ratio = ta.scrollTop / (ta.scrollHeight - ta.clientHeight || 1);
    syncingRef.current = true;
    pane.scrollTop = ratio * (pane.scrollHeight - pane.clientHeight);
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  const onPreviewScroll = useCallback(() => {
    if (syncingRef.current) return;
    const ta = taRef.current;
    const pane = previewPaneRef.current;
    if (!ta || !pane) return;
    const ratio = pane.scrollTop / (pane.scrollHeight - pane.clientHeight || 1);
    syncingRef.current = true;
    ta.scrollTop = ratio * (ta.scrollHeight - ta.clientHeight);
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  const prevent = (e: React.MouseEvent) => e.preventDefault();

  const fontStyle = {
    fontFamily: `'${settings.font_family}', ui-monospace, monospace, system-ui, sans-serif`,
    fontSize: `${settings.font_size}px`,
    lineHeight: settings.line_height,
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 1;

  return (
    <div className="md-editor">
      <div className="md-toolbar">
        <div className="md-toolbar-group">
          <button className="md-tool-btn" title="Heading 1" onMouseDown={prevent} onClick={() => prependLine("# ")}><Heading1 size={14} /></button>
          <button className="md-tool-btn" title="Heading 2" onMouseDown={prevent} onClick={() => prependLine("## ")}><Heading2 size={14} /></button>
          <button className="md-tool-btn" title="Heading 3" onMouseDown={prevent} onClick={() => prependLine("### ")}><Heading3 size={14} /></button>
        </div>
        <div className="md-toolbar-sep" />
        <div className="md-toolbar-group">
          <button className="md-tool-btn" title="Bold (Ctrl+B)" onMouseDown={prevent} onClick={() => wrap("**", "**", "bold")}><Bold size={14} /></button>
          <button className="md-tool-btn" title="Italic (Ctrl+I)" onMouseDown={prevent} onClick={() => wrap("*", "*", "italic")}><Italic size={14} /></button>
          <button className="md-tool-btn" title="Strikethrough" onMouseDown={prevent} onClick={() => wrap("~~", "~~", "text")}><Strikethrough size={14} /></button>
        </div>
        <div className="md-toolbar-sep" />
        <div className="md-toolbar-group">
          <button className="md-tool-btn" title="Inline code (Ctrl+`)" onMouseDown={prevent} onClick={() => wrap("`", "`", "code")}><Code size={14} /></button>
          <button className="md-tool-btn md-tool-text-btn" title="Code block" onMouseDown={prevent} onClick={() => wrap("```\n", "\n```", "code")}>```</button>
          <button className="md-tool-btn" title="Blockquote" onMouseDown={prevent} onClick={() => prependLine("> ")}><Quote size={14} /></button>
        </div>
        <div className="md-toolbar-sep" />
        <div className="md-toolbar-group">
          <button className="md-tool-btn" title="Link (Ctrl+K)" onMouseDown={prevent} onClick={insertLink}><Link size={14} /></button>
          <button className="md-tool-btn" title="Image" onMouseDown={prevent} onClick={insertImage}><ImageIcon size={14} /></button>
        </div>
        <div className="md-toolbar-sep" />
        <div className="md-toolbar-group">
          <button className="md-tool-btn" title="Unordered list" onMouseDown={prevent} onClick={() => prependLine("- ")}><List size={14} /></button>
          <button className="md-tool-btn" title="Ordered list" onMouseDown={prevent} onClick={() => prependLine("1. ")}><ListOrdered size={14} /></button>
          <button className="md-tool-btn" title="Table" onMouseDown={prevent} onClick={() => insertBlock("\n| Header | Header |\n| --- | --- |\n| Cell | Cell |\n")}><Table size={14} /></button>
          <button className="md-tool-btn" title="Horizontal rule" onMouseDown={prevent} onClick={() => insertBlock("\n\n---\n\n")}><Minus size={14} /></button>
        </div>

        <div className="md-toolbar-spacer" />

        {tab === "preview" && (
          <button
            className="md-tool-btn"
            title={sourceCollapsed ? "Show editor" : "Hide editor"}
            onMouseDown={prevent}
            onClick={() => setSourceCollapsed((v) => !v)}
          >
            {sourceCollapsed ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        )}

        <div className="md-tabs">
          <button
            className={`md-tab${tab === "preview" ? " active" : ""}`}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
          <button
            className={`md-tab${tab === "code" ? " active" : ""}`}
            onClick={() => setTab("code")}
          >
            Code
          </button>
        </div>
      </div>

      <div className="md-body">
        {tab === "preview" ? (
          <div className={`md-split${sourceCollapsed ? " md-split-collapsed" : ""}`}>
            {!sourceCollapsed && (
              <textarea
                ref={taRef}
                className="md-source-textarea"
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onScroll={onSourceScroll}
                spellCheck={false}
                dir="auto"
                style={fontStyle}
              />
            )}
            <div className="md-preview-pane" ref={previewPaneRef} onScroll={onPreviewScroll}>
              <div
                className="md-preview"
                style={{ fontSize: `${settings.font_size}px`, lineHeight: settings.line_height }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {content || "*Start writing...*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="editor-scroll">
            <textarea
              ref={taRef}
              className="editor-textarea"
              value={content}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
              spellCheck={false}
              dir="auto"
              style={fontStyle}
            />
          </div>
        )}
      </div>

      <div className="status-bar">
        <span>{lineCount} {lineCount === 1 ? "line" : "lines"}</span>
        <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        <span>{content.length} chars</span>
      </div>
    </div>
  );
}

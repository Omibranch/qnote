import { marked } from "marked";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { api } from "./api";
import type { Settings } from "../store/useStore";

marked.setOptions({ gfm: true, breaks: false });

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function exportPdf(
  content: string,
  isMarkdown: boolean,
  settings: Settings,
  fileName: string
) {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "export";
  const savePath = await save({
    defaultPath: `${baseName}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (!savePath) return;

  try {
    await api.exportPdf(savePath, content, isMarkdown, baseName, settings);
    await openPath(savePath);
  } catch (err) {
    alert(String(err));
  }
}

export async function exportHtml(
  content: string,
  isMarkdown: boolean,
  settings: Settings,
  fileName: string
) {
  const isDark = settings.theme === "dark";
  const bg      = isDark ? "#0e0e10" : "#f9f9fb";
  const fg      = isDark ? "#e8e8ec" : "#111115";
  const fg2     = isDark ? "#9090a0" : "#6b6b80";
  const border  = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
  const codeBg  = isDark ? "#1e1e22" : "#f0f0f4";
  const accent  = isDark ? "#8b7cf8" : "#6c5ce7";
  const blockBg = isDark ? "#17171a" : "#f4f4f8";

  const bodyHtml = isMarkdown
    ? (marked.parse(content) as string)
    : `<pre class="plain">${esc(content)}</pre>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(fileName)}</title>
<style>
@media print {
  body { background: #fff !important; color: #111 !important; }
  pre, code { background: #f5f5f5 !important; }
  blockquote { border-color: #ccc !important; }
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: ${settings.font_size}px; }
body {
  font-family: '${settings.font_family}', ui-monospace, system-ui, sans-serif;
  line-height: ${settings.line_height};
  background: ${bg};
  color: ${fg};
  padding: 52px 64px;
  max-width: 900px;
  margin: 0 auto;
}
h1,h2,h3,h4,h5,h6 { color: ${fg}; font-weight: 600; margin: 1.4em 0 0.5em; line-height: 1.3; }
h1 { font-size: 2em; border-bottom: 1px solid ${border}; padding-bottom: 0.3em; }
h2 { font-size: 1.5em; border-bottom: 1px solid ${border}; padding-bottom: 0.25em; }
h3 { font-size: 1.25em; }
h4 { font-size: 1em; }
p { margin: 0.75em 0; }
a { color: ${accent}; text-decoration: none; }
a:hover { text-decoration: underline; }
code { background: ${codeBg}; border: 1px solid ${border}; border-radius: 4px; padding: 0.15em 0.4em; font-size: 0.88em; font-family: inherit; }
pre { background: ${codeBg}; border: 1px solid ${border}; border-radius: 8px; padding: 16px 20px; overflow-x: auto; margin: 1em 0; }
pre code { background: none; border: none; padding: 0; font-size: 0.9em; }
pre.plain { white-space: pre-wrap; word-break: break-word; font-size: 1em; color: ${fg}; background: none; border: none; padding: 0; }
blockquote { border-left: 3px solid ${accent}; background: ${blockBg}; margin: 1em 0; padding: 0.6em 1em; color: ${fg2}; border-radius: 0 6px 6px 0; }
ul, ol { padding-left: 1.6em; margin: 0.75em 0; }
li { margin: 0.3em 0; }
hr { border: none; border-top: 1px solid ${border}; margin: 1.5em 0; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; }
th, td { border: 1px solid ${border}; padding: 8px 12px; text-align: left; }
th { background: ${codeBg}; font-weight: 600; }
tr:nth-child(even) td { background: ${blockBg}; }
img { max-width: 100%; height: auto; border-radius: 6px; }
input[type="checkbox"] { margin-right: 0.4em; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;

  const baseName = fileName.replace(/\.[^.]+$/, "") || "export";
  const savePath = await save({
    defaultPath: `${baseName}.html`,
    filters: [{ name: "HTML", extensions: ["html"] }],
  });
  if (!savePath) return;

  await api.writeFile(savePath, html);
  await openPath(savePath);
}

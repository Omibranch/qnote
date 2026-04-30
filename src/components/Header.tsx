import { Menu, FilePlus, FolderOpen, Save, SaveAll, FileOutput, FileCode, ScanText, History, Settings, Sun, Moon, Minus, Square, X } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store/useStore";
import { openFile, saveFile, saveFileAs } from "../lib/fileOps";
import { exportPdf, exportHtml } from "../lib/pdfExport";
import { api } from "../lib/api";

const win = getCurrentWindow();

export function Header() {
  const {
    fileName, isDirty, sidebarOpen, setSidebarOpen,
    setSettingsOpen, settings, updateSettings, newFile,
    showWindowControls, isMarkdown, setIsMarkdown, content,
    setContent, setHistoryPanelOpen, filePath,
  } = useStore();

  const handleClose = () => {
    invoke("exit_app");
  };

  const toggleTheme = () =>
    updateSettings({ theme: settings.theme === "dark" ? "light" : "dark" });

  const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (!target.closest("button")) {
      win.startDragging();
    }
  };

  const handleOcr = async () => {
    const imagePath = await api.openImageDialog();
    if (!imagePath) return;
    try {
      const text = await api.ocrImage(imagePath);
      if (text) {
        setContent(content ? content + "\n\n" + text : text);
      }
    } catch (err) {
      alert(String(err));
    }
  };

  return (
    <header className="header" onMouseDown={handleMouseDown}>
      <div className="header-left">
        <button
          className="icon-btn"
          title="Files (Ctrl+B)"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={17} />
        </button>
        <button className="icon-btn" title="New file (Ctrl+N)" onClick={newFile}>
          <FilePlus size={17} />
        </button>
        <button className="icon-btn" title="Open file (Ctrl+O)" onClick={openFile}>
          <FolderOpen size={17} />
        </button>
        <button className="icon-btn" title="Save (Ctrl+S)" onClick={saveFile}>
          <Save size={17} />
        </button>
        <button className="icon-btn" title="Save as (Ctrl+Shift+S)" onClick={saveFileAs}>
          <SaveAll size={17} />
        </button>

        <div className="win-controls-divider" />

        <button
          className="icon-btn"
          title="Export to PDF (requires typst)"
          onClick={() => exportPdf(content, isMarkdown, settings, fileName)}
        >
          <FileOutput size={17} />
        </button>
        <button
          className="icon-btn"
          title="Export to HTML"
          onClick={() => exportHtml(content, isMarkdown, settings, fileName)}
        >
          <FileCode size={17} />
        </button>
        <button
          className="icon-btn"
          title="OCR: extract text from image (requires tesseract)"
          onClick={handleOcr}
        >
          <ScanText size={17} />
        </button>
        <button
          className="icon-btn"
          title="Version history"
          disabled={!filePath}
          onClick={() => setHistoryPanelOpen(true)}
        >
          <History size={17} />
        </button>

        <div className="win-controls-divider" />

        <button
          className={`icon-btn md-mode-btn${isMarkdown ? " md-mode-active" : ""}`}
          title={isMarkdown ? "Switch to plain text" : "Switch to Markdown"}
          onClick={() => setIsMarkdown(!isMarkdown)}
        >
          MD
        </button>
      </div>

      <div className="header-center">
        <span className="filename">{fileName}</span>
        {isDirty && <span className="dirty-dot" />}
      </div>

      <div className="header-right">
        <button className="icon-btn" title="Toggle theme" onClick={toggleTheme}>
          {settings.theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="icon-btn"
          title="Settings (Ctrl+,)"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings size={17} />
        </button>

        {showWindowControls && (
          <>
            <div className="win-controls-divider" />
            <button className="icon-btn" title="Minimize" onClick={() => win.minimize()}>
              <Minus size={17} />
            </button>
            <button className="icon-btn" title="Maximize" onClick={() => win.toggleMaximize()}>
              <Square size={15} />
            </button>
            <button className="icon-btn icon-btn-close" title="Close" onClick={handleClose}>
              <X size={17} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

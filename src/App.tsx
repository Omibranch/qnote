import { useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Settings } from "./components/Settings";
import { VersionHistory } from "./components/VersionHistory";
import { DebugConsole } from "./components/DebugConsole";
import { useStore } from "./store/useStore";
import { api } from "./lib/api";
import { openFile, saveFile, saveFileAs } from "./lib/fileOps";

const KNOWN_DES = ["KDE", "GNOME", "XFCE", "X-Cinnamon", "MATE", "LXDE", "LXQt", "Pantheon", "Deepin", "Budgie", "Unity"];

export default function App() {
  const {
    settings,
    updateSettings,
    setHistory,
    newFile,
    setSidebarOpen,
    sidebarOpen,
    setSettingsOpen,
    setShowWindowControls,
  } = useStore();

  useEffect(() => {
    Promise.all([api.getSettings(), api.getHistory(), api.getDesktopEnv(), api.getPlatform()]).then(([s, h, env, platform]) => {
      updateSettings(s);
      setHistory(h);
      const isDE = KNOWN_DES.some((de) => (env as string).toUpperCase().includes(de.toUpperCase()));
      setShowWindowControls(isDE || platform === "windows" || platform === "macos");
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      if (e.code === "KeyN") {
        e.preventDefault();
        newFile();
      } else if (e.code === "KeyO") {
        e.preventDefault();
        openFile();
      } else if (e.code === "KeyS" && e.shiftKey) {
        e.preventDefault();
        saveFileAs();
      } else if (e.code === "KeyS") {
        e.preventDefault();
        saveFile();
      } else if (e.code === "KeyB") {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      } else if (e.code === "Comma") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className={`app ${settings.theme}`}>
      <Header />
      {settings.debug_mode && <DebugConsole />}
      <div className="app-body">
        <Sidebar />
        <Editor />
      </div>
      <Settings />
      <VersionHistory />
    </div>
  );
}

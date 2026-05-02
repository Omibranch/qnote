import { create } from "zustand";

export interface HistoryEntry {
  path: string;
  title: string;
  last_opened: number;
}

export interface VersionEntry {
  timestamp_ms: number;
  size: number;
  preview: string;
}

export interface Settings {
  retention_days: number;
  font_family: string;
  font_size: number;
  theme: "dark" | "light";
  line_height: number;
  version_interval_minutes: number;
  debug_mode: boolean;
  accent_dark: string;
  accent_light: string;
  bg_dark: string;
  bg_light: string;
  show_grid: boolean;
}

const defaultSettings: Settings = {
  retention_days: 7,
  font_family: "JetBrains Mono",
  font_size: 15,
  theme: "dark",
  line_height: 1.7,
  version_interval_minutes: 10,
  debug_mode: false,
  accent_dark: "#8a9a8c",
  accent_light: "#3c4d3e",
  bg_dark: "#111213",
  bg_light: "#f5f5f0",
  show_grid: false,
};

interface AppState {
  content: string;
  filePath: string | null;
  fileName: string;
  isDirty: boolean;
  isMarkdown: boolean;
  history: HistoryEntry[];
  settings: Settings;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  historyPanelOpen: boolean;
  showWindowControls: boolean;

  setContent: (content: string) => void;
  openFile: (path: string, name: string, content: string) => void;
  markSaved: (path: string, name: string) => void;
  newFile: () => void;
  setIsMarkdown: (v: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setHistoryPanelOpen: (open: boolean) => void;
  setHistory: (history: HistoryEntry[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setShowWindowControls: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  content: "",
  filePath: null,
  fileName: "Untitled",
  isDirty: false,
  isMarkdown: false,
  history: [],
  settings: defaultSettings,
  sidebarOpen: false,
  settingsOpen: false,
  historyPanelOpen: false,
  showWindowControls: false,

  setContent: (content) => set({ content, isDirty: true }),
  openFile: (path, name, content) =>
    set({ filePath: path, fileName: name, content, isDirty: false, isMarkdown: name.endsWith(".md") }),
  markSaved: (path, name) =>
    set({ filePath: path, fileName: name, isDirty: false, isMarkdown: name.endsWith(".md") }),
  newFile: () =>
    set({ content: "", filePath: null, fileName: "Untitled", isDirty: false, isMarkdown: false }),
  setIsMarkdown: (v) => set({ isMarkdown: v }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setHistoryPanelOpen: (open) => set({ historyPanelOpen: open }),
  setHistory: (history) => set({ history }),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),
  setShowWindowControls: (show) => set({ showWindowControls: show }),
}));

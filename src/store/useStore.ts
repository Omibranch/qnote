import { create } from "zustand";

export interface HistoryEntry {
  path: string;
  title: string;
  last_opened: number;
}

export interface Settings {
  retention_days: number;
  font_family: string;
  font_size: number;
  theme: "dark" | "light";
  line_height: number;
}

const defaultSettings: Settings = {
  retention_days: 7,
  font_family: "JetBrains Mono",
  font_size: 15,
  theme: "dark",
  line_height: 1.7,
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
  showWindowControls: boolean;

  setContent: (content: string) => void;
  openFile: (path: string, name: string, content: string) => void;
  markSaved: (path: string, name: string) => void;
  newFile: () => void;
  setIsMarkdown: (v: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
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
  setHistory: (history) => set({ history }),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),
  setShowWindowControls: (show) => set({ showWindowControls: show }),
}));

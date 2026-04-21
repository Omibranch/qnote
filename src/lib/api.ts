import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import type { HistoryEntry, Settings } from "../store/useStore";

export const api = {
  readFile: (path: string): Promise<string> =>
    invoke("read_file", { path }),

  writeFile: (path: string, content: string): Promise<void> =>
    invoke("write_file", { path, content }),

  getHistory: (): Promise<HistoryEntry[]> => invoke("get_history"),

  addToHistory: (path: string, title: string): Promise<void> =>
    invoke("add_to_history", { path, title }),

  getSettings: (): Promise<Settings> => invoke("get_settings"),

  saveSettings: (settings: Settings): Promise<void> =>
    invoke("save_settings", { settings }),

  getSystemFonts: (): Promise<string[]> => invoke("get_system_fonts"),

  searchFiles: (query: string): Promise<HistoryEntry[]> =>
    invoke("search_files", { query }),

  getDesktopEnv: (): Promise<string> => invoke("get_desktop_env"),

  async openFileDialog(): Promise<{
    path: string;
    content: string;
    name: string;
  } | null> {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Text files",
          extensions: [
            "txt", "md", "mdx", "rs", "ts", "tsx", "js", "jsx",
            "json", "toml", "yaml", "yml", "py", "go", "sh", "fish",
            "html", "css", "scss", "xml", "ini", "conf", "env",
          ],
        },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (!selected || typeof selected !== "string") return null;
    const content = await api.readFile(selected);
    const name = selected.split("/").pop() || "Untitled";
    return { path: selected, content, name };
  },

  async saveFileDialog(
    content: string,
    defaultName: string
  ): Promise<string | null> {
    const path = await save({
      defaultPath: defaultName,
      filters: [
        { name: "Text", extensions: ["txt", "md"] },
        { name: "All files", extensions: ["*"] },
      ],
    });
    if (!path) return null;
    await api.writeFile(path, content);
    return path;
  },
};
